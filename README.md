# Sparkle Try-On

A browser-based augmented-reality jewellery fitting room. Sparkle Try-On uses MediaPipe face and hand landmarks with React Three Fiber to place interactive 3D jewellery on a live camera feed.

## What it can do

- Track face landmarks for earrings, necklaces and glasses
- Track up to two hands for rings and bracelets
- Render nine built-in 3D jewellery and eyewear models
- Combine multiple pieces in one look
- Mirror or unmirror the live camera while keeping AR placement aligned
- Upload a custom PNG, JPEG or WebP piece (up to 5 MB)
- Capture a PNG containing both the camera image and visible AR layers
- Recover gracefully from camera, tracking and WebGL errors
- Adapt the catalogue and camera experience to mobile and desktop screens

All camera processing happens in the browser. The app does not upload or store camera frames.

## Tech stack

- React 18 and TypeScript
- Vite
- MediaPipe Tasks Vision
- Three.js, React Three Fiber and Drei
- Tailwind CSS and shadcn/ui
- Vitest
- GitHub Actions

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
git clone https://github.com/Arul1998/sparkle-tryon.git
cd sparkle-tryon
npm ci
npm run dev
```

Open the local URL printed by Vite and choose **Try It On**. Camera access works on localhost; production deployments must use HTTPS.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

The CI workflow runs these checks for every push and pull request.

## Deployment

This is a static Vite app and can be deployed to Vercel, Netlify, Cloudflare Pages, GitHub Pages, StackBlitz, Bolt or any host that serves the built `dist` directory over HTTPS.

Build command: `npm run build`  
Output directory: `dist`

## Browser support and limitations

Use a current version of Chrome, Edge, Safari or Firefox with WebGL and camera permissions enabled. Landmark accuracy varies with lighting, camera angle and occlusion. Custom uploads are flat image overlays; the built-in collection uses 3D models.

## License

MIT
