#!/bin/sh
# Deploy the Dot Opera site to Vercel (project dot-opera, team iaintaits-projects).
# Builds, copies only the site's files into a temp folder, deploys from there.
# The repo root is linked to a different Vercel project, so never deploy from it.
set -e
cd "$(dirname "$0")"
npm run build
D=$(mktemp -d)
cp dist/index.html dist/about.html dist/engine.js "$D/"
for f in operas/*.js; do
  id=$(basename "$f" .js)
  case "$id" in hello|scratch*) continue;; esac
  cp "dist/$id.html" "dist/$id.js" "dist/$id.standalone.html" "$D/"
done
mkdir -p "$D/.vercel"
printf '{"projectId":"prj_6zA8C35acUnDtv6Xf3tx3zie7YBV","orgId":"team_FpWo16dgNge5umG3hrVhf2Xf","projectName":"dot-opera"}' > "$D/.vercel/project.json"
printf '.env*\n.gitignore\n' > "$D/.vercelignore"
(cd "$D" && vercel deploy --prod --yes)
rm -rf "$D"
echo "live: https://dot-opera.vercel.app"
