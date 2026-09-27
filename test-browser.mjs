import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runBrowserTest(pageUrl) {
  console.log(`\n--- Testing ${pageUrl} ---`);
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--autoplay-policy=no-user-gesture-required',
    'about:blank',
  ]);

  let killed = false;
  const cleanup = () => {
    if (!killed) {
      killed = true;
      chrome.kill('SIGKILL');
    }
  };
  process.on('exit', cleanup);

  try {
    // Wait for Chrome to be ready
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 100));
      try {
        targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
        if (targets && targets.length) break;
      } catch {}
    }

    if (!targets || !targets.length) {
      throw new Error('Chrome failed to start or open port');
    }

    const wsUrl = targets[0].webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const pending = new Map();
    const errors = [];

    const send = (method, params = {}) => {
      const id = msgId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        const details = msg.params.exceptionDetails;
        errors.push({
          text: details.text,
          exception: details.exception?.description || details.exception?.value,
          stack: details.stackTrace,
        });
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        if (msg.params.type === 'error') {
          errors.push({
            consoleError: msg.params.args.map((a) => a.value || a.description).join(' '),
          });
        }
      }
      if (msg.method === 'Network.responseReceived') {
        console.log('HTTP', msg.params.response.status, msg.params.response.url);
      }
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    const loadPromise = new Promise((resolve) => {
      const origHandler = ws.onmessage;
      ws.onmessage = (event) => {
        origHandler(event);
        const msg = JSON.parse(event.data);
        if (msg.method === 'Page.loadEventFired') {
          resolve();
        }
      };
    });

    await send('Page.navigate', { url: pageUrl });
    await loadPromise;

    // Small delay for script execution
    await new Promise((r) => setTimeout(r, 200));

    // Execute step-through test
    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          if (!window.O || !window.O.opera) {
            throw new Error('window.O or window.O.opera missing');
          }
          if (!O.tl) {
            O.start();
            O.load(O.opera);
          }
          const dur = O.duration || 60;
          const acts = (O.acts || []).map((a) => a.name);
          console.log('Opera loaded:', O.opera.title, 'Duration:', dur, 'Acts:', acts);
          // Advance timeline in small steps across the entire duration
          for (let t = 0; t <= dur + 0.5; t += 0.2) {
            O.tl.seek(t, true);
            if (O.onFrame) O.onFrame(t);
          }
          // Also toggle language back and forth across acts
          if (O.setLang) {
            O.setLang('orig');
            O.tl.seek(dur * 0.5, true);
            O.setLang('en');
            O.tl.seek(dur * 0.9, true);
          }
          return { title: O.opera.title, dur, acts };
        })()
      `,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log('Playback result:', evalRes.result?.value);

    if (evalRes.exceptionDetails) {
      errors.push({
        evalException: evalRes.exceptionDetails.exception?.description || evalRes.exceptionDetails.text,
      });
    }

    // Give a brief moment for any pending requestAnimationFrame or light loop ticks
    await new Promise((r) => setTimeout(r, 500));

    ws.close();
    cleanup();

    if (errors.length > 0) {
      console.error(`FAILED: ${errors.length} error(s) detected during playback of ${pageUrl}:`);
      console.error(JSON.stringify(errors, null, 2));
      return false;
    } else {
      console.log(`PASSED: ${pageUrl} played through cleanly with 0 errors! Result:`, evalRes.result?.value);
      return true;
    }
  } finally {
    cleanup();
  }
}

async function main() {
  const pages = [
    'http://localhost:5173/dist/barber.html',
    'http://localhost:5173/dist/carmen.html',
  ];
  let allPassed = true;
  for (const page of pages) {
    const passed = await runBrowserTest(page);
    if (!passed) allPassed = false;
  }
  if (!allPassed) {
    process.exit(1);
  }
  console.log('\nAll browser tests PASSED successfully!\n');
}

main().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
