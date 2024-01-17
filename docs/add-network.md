# Add network

To add a new network, follow these steps:

1. Create a new file in `src/fixtures/networks` with the corresponding network, similar to the existing ones.

2. Ensure that the file name and the `chainTag` prop have the same short name.

3. Import the new network in `src/fixtures/networks/index.ts`, placing it in the correct position according to the desired ordering.

4. Include network icons in the `public/icons/network/{chainTag}.png` directory, and also in `public/icons/network/{chainTag}-testnet.png` if applicable.

5. Add the native token icon to `public/icons/nativeToken/{chainTag}.png`.

6. You're done!
