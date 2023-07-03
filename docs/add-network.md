# Add network

To add a new network, follow these steps:

1. Create a new file in `src/fixtures/networks` with the corresponding network, similar to the existing ones.

2. Ensure that the file name and the `chainTag` prop have the same short name.

3. Import the new network in `src/fixtures/networks/index.ts`, placing it in the correct position according to the desired ordering.

4. Update the `COINGECKO_NATIVE_TOKEN_IDS` variable with the appropriate native token ID obtained from CoinGecko.

5. Include network icons in the `public/icons/network/{chainTag}.png` directory, and also in `public/icons/network/{chainTag}-testnet.png` if applicable.

6. Add the native token icon to `public/icons/nativeToken/{chainTag}.png`.

7. You're done!
