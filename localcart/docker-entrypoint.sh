#!/bin/sh
set -e

echo '==> Waiting for PostgreSQL...'
until node -e "const n=require('net');const c=n.createConnection({port:5432,host:process.env.DB_HOST||'db'});c.on('connect',()=>{c.destroy();process.exit(0)});c.on('error',()=>process.exit(1))" 2>/dev/null; do
  echo '    still waiting...'
  sleep 2
done
echo '==> PostgreSQL is ready!'

echo '==> Running Prisma db push...'
node node_modules/prisma/build/index.js db push

echo '==> Starting Next.js...'
exec node server.js