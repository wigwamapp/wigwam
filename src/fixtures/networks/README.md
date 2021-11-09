## How to add a new network?

1. Create {chainTag}.ts file inside `src/fixtures/networks` dir.

2. Copy content from another existing one to this file.

3. Edit this file according to your desired network.

4. Put the network icon to `public/icons/network/{chainTag}.png` (optional). The icon is only used for the main network.

5. Open `src/fixtures/networks/index.ts` file. Import your networks and add them to `DEFAULT_NETWORKS`.
