# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.0.0 (2021-08-03)


### Features

* abis migrated for new deployment ([f45c1c0](https://github.com/Mean-Finance/dca-subgraph/commit/f45c1c06305804e61c216738c555acabad2e04ed))
* add global parameters as data source ([48223e4](https://github.com/Mean-Finance/dca-subgraph/commit/48223e43630b310cf4fae7474cfd73e4c7fb2b78))
* added more parameters to position state ([a17de75](https://github.com/Mean-Finance/dca-subgraph/commit/a17de7536ee7d7b7fdb543b00e42db7b3f0dc894))
* added position state ([d59b9fe](https://github.com/Mean-Finance/dca-subgraph/commit/d59b9fec25411ff4d7fe0269b944d383801b8f2e))
* added rinkeby setup ([eb014bc](https://github.com/Mean-Finance/dca-subgraph/commit/eb014bc1823df2d5c95e25d0e2d8628e78061c2b))
* added total deposits to positions ([0de0bb3](https://github.com/Mean-Finance/dca-subgraph/commit/0de0bb3163a1632868d9751a9284880950233fd0))
* adds dca id ([9bc97fb](https://github.com/Mean-Finance/dca-subgraph/commit/9bc97fb35c0d8ad77939d5de6771c906d753bdf9))
* adds local fork configuration ([7bb3482](https://github.com/Mean-Finance/dca-subgraph/commit/7bb34829858e0e56a1cd644cf6ccdbd93a761f3f))
* adds owner of positions ([fed9485](https://github.com/Mean-Finance/dca-subgraph/commit/fed94852c83c221d741d218f7eff191cc4e2904c))
* adds rates with fees calcs ([083f273](https://github.com/Mean-Finance/dca-subgraph/commit/083f2734cbf32b82a057187f80d6e241d42e6833))
* adds started at swap in position ([645caa6](https://github.com/Mean-Finance/dca-subgraph/commit/645caa6040c76fc11cdc5901b33a720222dafe73))
* adds total swapped to position ([7bda50c](https://github.com/Mean-Finance/dca-subgraph/commit/7bda50cb6180e286c8200f5eb1a14ecc8ea9fa20))
* basic position handling ([e1d831e](https://github.com/Mean-Finance/dca-subgraph/commit/e1d831edb02da48ab1eb1ce86a8d178a19c3be38))
* check if position should register swap ([fae56cf](https://github.com/Mean-Finance/dca-subgraph/commit/fae56cf87b91b890379532f14f0a61b21742c04a))
* get or create global parameters ([fefd234](https://github.com/Mean-Finance/dca-subgraph/commit/fefd23472a497a12ff8e14eb7a1ed44fe485415f))
* handles add swap intervals ([adbb0aa](https://github.com/Mean-Finance/dca-subgraph/commit/adbb0aab2367805eeb6489452dc3de6524f187ac))
* multiple networks configuration ([#4](https://github.com/Mean-Finance/dca-subgraph/issues/4)) ([e27d9d0](https://github.com/Mean-Finance/dca-subgraph/commit/e27d9d0e33ec996f401a4b9f723d1105cfec26f8))
* position gets affected by swaps ([80f624e](https://github.com/Mean-Finance/dca-subgraph/commit/80f624e0f470d84279560d6cb5b4a8fc73446e3a))
* starts tracking swaps ([181fa1c](https://github.com/Mean-Finance/dca-subgraph/commit/181fa1c08a264d88eb9e685c6018f2d072e91b0b))
* total swaps added to position ([64ea649](https://github.com/Mean-Finance/dca-subgraph/commit/64ea6498015c6d49ed9b5fbdb27bc5d6777b44e9))
* total swaps added to position ([a2c114e](https://github.com/Mean-Finance/dca-subgraph/commit/a2c114eff3042f25278763cac78d43e715e99a11))
* track withdrew ([ec31115](https://github.com/Mean-Finance/dca-subgraph/commit/ec31115879985dd88adb15f200caf39e0061d716))
* updated dependencies ([d6bdb75](https://github.com/Mean-Finance/dca-subgraph/commit/d6bdb751f8adbf16be151bed43e97d0b7cf3254f))


### Bug Fixes

* 🐛 dont include unsolicited swaps on position handling ([#2](https://github.com/Mean-Finance/dca-subgraph/issues/2)) ([6635d8c](https://github.com/Mean-Finance/dca-subgraph/commit/6635d8cdd1e0344fb91d66e6ad2cf041f1fd6a45))
* enables user on position again ([bff7397](https://github.com/Mean-Finance/dca-subgraph/commit/bff73979609d9cbfa02d42f65fc76460829162d0))
* get magnitude of token ([00e4416](https://github.com/Mean-Finance/dca-subgraph/commit/00e4416fddc6fb552fb02894aa8d7c62e167d292))
* global parameters pluralized bug ([b5cb81c](https://github.com/Mean-Finance/dca-subgraph/commit/b5cb81cfe7ef2071c35c1db0c08f77a28317cdee))
* loops through the last position of the pair ([be12495](https://github.com/Mean-Finance/dca-subgraph/commit/be12495a62df294b4bf88f003d81875c4e626d37))
* pair swapped id ([#1](https://github.com/Mean-Finance/dca-subgraph/issues/1)) ([5b40775](https://github.com/Mean-Finance/dca-subgraph/commit/5b40775e35a0023ae30106690935efc50bccc38d))
* position ids are now really unique ([47bd0da](https://github.com/Mean-Finance/dca-subgraph/commit/47bd0dad7adfe57c18b9fdc6a88e18a3d11af9cb))
* rates with fees correctly accounted for ([cbfd1c9](https://github.com/Mean-Finance/dca-subgraph/commit/cbfd1c9819f7cae35d6c7536d647e2d9cb405bbd))
* stop using transaction.to on position library ([1d85f1c](https://github.com/Mean-Finance/dca-subgraph/commit/1d85f1c752870fbb89cd0921b04982221dedfdda))
* total deposits correctly calculated for ([c9844b3](https://github.com/Mean-Finance/dca-subgraph/commit/c9844b34e7934db3c22f84f588e3a436760469e5))
* total swaps stops getting modified in swapped ([aec12b2](https://github.com/Mean-Finance/dca-subgraph/commit/aec12b25ca0a94582242cfe41579866e1c9b5b00))
