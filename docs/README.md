# Run user javascript in a metaframe

This is a metaframe:

[![](https://mermaid.ink/svg/pako:eNqFkU9LxDAQxb9KiJcVuqC9KBG8uN7sRT1JL2MzaYP5RzJhle1-d9NWd1HBnVMm770fw8yOd14iF7yPEAb28Ng6VqozkNIGFbPhzhsfmdLGiLPrK3mhVJUo-jf81a63WtIg6vB-szBSfl2gFgkC9Lh8T2VQ0eUqh5JEsLNBRbB4ztbr21G7kCmNrFk9Dzqx5qAKIb7m-YmqT6OOgWYS2OgzLVLU_VCGkX7r_jBOpOr_Uuhk63jFLUYLWpYV7yah5TSgxZaL8pSoIBtqeev2xZqDBMJ7qclHLhSYhBWHTP7pw3VcUMz4bdpoKMu1B1cA9-L9sccZ0iy3nU-8_wSxOqSj)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNqFkU9LxDAQxb9KiJcVuqC9KBG8uN7sRT1JL2MzaYP5RzJhle1-d9NWd1HBnVMm770fw8yOd14iF7yPEAb28Ng6VqozkNIGFbPhzhsfmdLGiLPrK3mhVJUo-jf81a63WtIg6vB-szBSfl2gFgkC9Lh8T2VQ0eUqh5JEsLNBRbB4ztbr21G7kCmNrFk9Dzqx5qAKIb7m-YmqT6OOgWYS2OgzLVLU_VCGkX7r_jBOpOr_Uuhk63jFLUYLWpYV7yah5TSgxZaL8pSoIBtqeev2xZqDBMJ7qclHLhSYhBWHTP7pw3VcUMz4bdpoKMu1B1cA9-L9sccZ0iy3nU-8_wSxOqSj)



that runs arbitrary user javascript that embeds in the URL:

 - user created javascript
 - user defined css modules

Think of this like [codepen](https://codepen.io) or [others](https://www.sitepoint.com/code-playgrounds/) but stripped down focusing on core essentials, performance, and durability

## How it works

Using this URL for creation:

[https://js-create.mtfm.io](https://js-create.mtfm.io)

it generates a final metaframe URL (embedded values are base64 encoded):

https://js.mtfm.io/#?js=<<span style="color:blue">javascript</span>>&c=<<span style="color:red">modules</span>>


**Architecture:**

[![](https://mermaid.ink/svg/pako:eNpdUctOAzEM_JXISAikdou4gIKAA-W4JzihXMzG6abkpcRbitr-O9umUKk-WDP2eGTZG-iiJpCwyJh68T5XQYzROSxlTkb49BJdzMJY5-TF_Z2-MWZSOMcvOqPTb6u5l7dp_VA9yvBZTT0xJlxQLe-jvVLQM6ciZ7NlaTwb39g4u3helsemaS67fVZwLaU8LnCaPUcUdAWtmE6fxHZZBAYtOrFCN1DZikJ5RUeDiqtQ2KBp3fTs3Va0ta8CTMBT9mj1eJTNvqqAe_KkQI5Qk8HBsQIVdqN0SBqZXrXlmEEadIUmgAPHt5_QgeQ80J9obnE8h_9XJQwfMZ44HUza-o3DU3a_L1qDWw)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNpdUctOAzEM_JXISAikdou4gIKAA-W4JzihXMzG6abkpcRbitr-O9umUKk-WDP2eGTZG-iiJpCwyJh68T5XQYzROSxlTkb49BJdzMJY5-TF_Z2-MWZSOMcvOqPTb6u5l7dp_VA9yvBZTT0xJlxQLe-jvVLQM6ciZ7NlaTwb39g4u3helsemaS67fVZwLaU8LnCaPUcUdAWtmE6fxHZZBAYtOrFCN1DZikJ5RUeDiqtQ2KBp3fTs3Va0ta8CTMBT9mj1eJTNvqqAe_KkQI5Qk8HBsQIVdqN0SBqZXrXlmEEadIUmgAPHt5_QgeQ80J9obnE8h_9XJQwfMZ44HUza-o3DU3a_L1qDWw)


 - no state is stored on the server (all embedded in the URL)
   - this imposes some limits but current URL lengths are large or not specifically limited
 - The final URL is ready by the server to create the single `index.html` with the modules and css embedded
 - The final URL then runs the embedded javascript

The server runs on https://deno.com/deploy which is

 - simple
 - fast
 - very performant
 - deploys immediately with a simply push to the repository
 - 🌟🌟🌟🌟🌟
