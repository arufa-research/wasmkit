/* eslint-disable no-use-before-define */
// This file defines the different config types.
//
// For each possible kind of config value, we have two type:
//
// One that ends with UserConfig, which represent the config as
// written in the user's config file.
//
// The other one, with the same name except without the User part, represents
// the resolved value as used during the wasmKit execution.
//
// Note that while many declarations are repeated here (i.e. network types'
// fields), we don't use `extends` as that can interfere with plugin authors
// trying to augment the config types.
// Networks config\

import * as types from "./internal/core/params/argument-types";

export enum ChainType {
  Secret,
  Juno,
  Osmosis,
  Archway,
  Neutron,
  Atom,
  Terra,
  Injective,
}

export interface Account {
  name: string
  address: string
  mnemonic: string
}

export interface Coin {
  readonly denom: string
  readonly amount: string
}

export interface FeePool {
  community_pool: Coin[]
}

export interface TxnStdFee {
  readonly amount: Coin[]
  readonly gas: string
}

export interface StdFee {
  readonly upload: TxnStdFee
  readonly init: TxnStdFee
  readonly exec: TxnStdFee
  readonly send: TxnStdFee
  readonly amount: Coin[]
  readonly gas: string
}

export interface UserAccount {
  account: Account
  getBalance: () => Promise<Coin[]>
}

export interface ContractInfo {
  codeId: number
  contractCodeHash: string
  deployTimestamp: string
}

export interface Checkpoints {
  [network: string]: CheckpointInfo
}

export interface CheckpointInfo {
  deployInfo?: DeployInfo
  instantiateInfo?: [InstantiateInfo]
  metadata?: Map<string, string>
}

export interface InstantiateInfo {
  instantiateTag: string
  contractAddress: string
  instantiateTimestamp: string
}

export interface DeployInfo {
  codeId: number
  contractCodeHash: string
  deployTimestamp: string
}

export type WasmKitNetworkAccountsUserConfig = Account[];

export interface WasmKitNetworkUserConfig {
  endpoint: string
  accounts: WasmKitNetworkAccountsUserConfig
  gasLimit?: string | number
  chainId: string
  // TODO: check fees // add type
  fees?: Partial<{
    upload: {
      amount: Array<{
        amount: string
        denom: string
      }>
      gas: string
    }
    init: {
      amount: Array<{
        amount: string
        denom: string
      }>
      gas: string
    }
    exec: {
      amount: Array<{
        amount: string
        denom: string
      }>
      gas: string
    }
  }>
}

export interface WasmKitLocalNetworkUserConfig {
  docker_image: string
  rpc_port: number
  rest_port: number
  flags?: string[]
  docker_command?: string
}

export interface NetworksUserConfig {
  [networkName: string]: NetworkUserConfig | undefined
}

export interface LocalNetworksUserConfig {
  [localNetworkName: string]: LocalNetworkUserConfig | undefined
}

export type NetworkUserConfig = WasmKitNetworkUserConfig;
export type LocalNetworkUserConfig = WasmKitLocalNetworkUserConfig;

export type WasmkitNetworkConfig = WasmKitNetworkUserConfig;
export type WasmkitLocalNetworkConfig = WasmKitLocalNetworkUserConfig;

export type NetworkConfig = WasmkitNetworkConfig;
export type LocalNetworkConfig = WasmkitLocalNetworkConfig;

export interface Networks {
  [networkName: string]: WasmkitNetworkConfig
}

export interface LocalNetworks {
  [localNetworkName: string]: WasmkitLocalNetworkConfig
}

export interface Commands {
  compile: string
  schema: string
}

export interface Playground {
  title: string
  tagline: string
  favicon: string
  logoLight: string
  logoDark: string
  theme: {
    light_background: string
    dark_background: string
  }
  socials: {
    twitter: string
    discord: string
    telegram: string
    github: string
  }

}

export type WasmKitNetworkAccountsConfig =
  | WasmKitNetworkHDAccountsConfig
  | WasmKitNetworkAccountConfig[];

export interface WasmKitNetworkAccountConfig {
  privateKey: string
  balance: string
}

export interface WasmKitNetworkHDAccountsConfig {
  mnemonic: string
  initialIndex: number
  count: number
  path: string
  accountsBalance: string
}

export interface WasmKitNetworkForkingConfig {
  enabled: boolean
  url: string
  blockNumber?: number
}

export interface HttpNetworkConfig {
  chainId?: number
  from?: string
  gas: 'auto' | number
  gasPrice: 'auto' | number
  gasMultiplier: number
  url: string
  timeout: number
  httpHeaders: { [name: string]: string }
  accounts: HttpNetworkAccountsConfig
}

export type HttpNetworkAccountsConfig =
  | 'remote'
  | string[]
  | HttpNetworkHDAccountsConfig;

export interface HttpNetworkHDAccountsConfig {
  mnemonic: string
  initialIndex: number
  count: number
  path: string
}

export interface DockerConfig {
  sudo: boolean
  runTestnet?: string
}

// Project paths config

export interface ProjectPathsUserConfig {
  root?: string
  cache?: string
  artifacts?: string
  tests?: string
}

export interface ProjectPathsConfig {
  root: string
  configFile: string
  cache: string
  artifacts: string
  tests: string
  sources: string
}

// WasmKit config
export type UserPaths = Omit<Partial<ProjectPathsConfig>, "configFile">;

export interface Config {
  networks?: Networks
  localnetworks?: LocalNetworks
  paths?: UserPaths
  mocha?: Mocha.MochaOptions
  commands?: Commands
  playground?: Playground
}

export interface WasmKitUserConfig {
  defaultNetwork?: string
  paths?: ProjectPathsUserConfig
  networks?: NetworksUserConfig
  localnetworks?: LocalNetworksUserConfig
  commands?: Commands
  mocha?: Mocha.MochaOptions
  docker?: DockerConfig
  playground?: Playground
}

export interface WasmKitConfig {
  defaultNetwork: string
  paths: ProjectPathsConfig
  networks: Networks
  localnetworks: LocalNetworks
  commands: Commands
  mocha: Mocha.MochaOptions
  docker: DockerConfig
  playground: Playground
}

// Plugins config functionality

export type ConfigExtender = (
  config: ResolvedConfig,
  userConfig: Readonly<WasmKitUserConfig>
) => void;

/**
 * A function that receives a RuntimeEnv and
 * modify its properties or add new ones.
 */
export type EnvironmentExtender = (env: WasmkitRuntimeEnvironment) => void;

/**
 * @type TaskArguments {object-like} - the input arguments for a task.
 *
 * TaskArguments type is set to 'any' because it's interface is dynamic.
 * It's impossible in TypeScript to statically specify a variadic
 * number of fields and at the same time define specific types for\
 * the argument values.
 *
 * For example, we could define:
 * type TaskArguments = Record<string, any>;
 *
 * ...but then, we couldn't narrow the actual argument value's type in compile time,
 * thus we have no other option than forcing it to be just 'any'.
 */
export type TaskArguments = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export type RunTaskFunction = (
  name: string,
  taskArguments?: TaskArguments
) => PromiseAny;

export interface RunSuperFunction<ArgT extends TaskArguments> {
  (taskArguments?: ArgT): PromiseAny
  isDefined: boolean
}

export type ActionType<ArgsT extends TaskArguments> = (
  taskArgs: ArgsT,
  env: WasmkitRuntimeEnvironment,
  runSuper: RunSuperFunction<ArgsT>
) => PromiseAny;

export interface Network {
  name: string
  config: NetworkConfig
  // provider:
}

interface RustVersion {
  version: string
}

export interface ResolvedConfig extends WasmKitUserConfig {
  paths?: ProjectPathsConfig
  rust?: RustVersion
  networks: Networks
  localnetworks: LocalNetworks
  commands: Commands
  playground?: Playground

}

/**
 * WasmKit arguments:
 * + network: the network to be used (default="default").
 * + showStackTraces: flag to show stack traces.
 * + version: flag to show wasmKit's version.
 * + help: flag to show wasmKit's help message.
 * + config: used to specify wasmKit's config file.
 */
export interface RuntimeArgs {
  network: string
  command?: string
  useCheckpoints?: boolean
  showStackTraces: boolean
  version: boolean
  help: boolean
  config?: string
  verbose: boolean
}

export interface ConfigurableTaskDefinition {
  setDescription: (description: string) => this

  setAction: (action: ActionType<TaskArguments>) => this

  addParam: <T>(
    name: string,
    description?: string,
    defaultValue?: T,
    type?: types.ArgumentType<T>,
    isOptional?: boolean
  ) => this

  addOptionalParam: <T>(
    name: string,
    description?: string,
    defaultValue?: T,
    type?: types.ArgumentType<T>
  ) => this

  addPositionalParam: <T>(
    name: string,
    description?: string,
    defaultValue?: T,
    type?: types.ArgumentType<T>,
    isOptional?: boolean
  ) => this

  addOptionalPositionalParam: <T>(
    name: string,
    description?: string,
    defaultValue?: T,
    type?: types.ArgumentType<T>
  ) => this

  addVariadicPositionalParam: <T>(
    name: string,
    description?: string,
    defaultValue?: T[],
    type?: types.ArgumentType<T>,
    isOptional?: boolean
  ) => this

  addOptionalVariadicPositionalParam: <T>(
    name: string,
    description?: string,
    defaultValue?: T[],
    type?: types.ArgumentType<T>
  ) => this

  addFlag: (name: string, description?: string) => this
}

export interface ParamDefinition<T> {
  name: string
  shortName?: string
  defaultValue?: T
  type: types.ArgumentType<T>
  description?: string
  isOptional: boolean
  isFlag: boolean
  isVariadic: boolean
}

export type ParamDefinitionAny = ParamDefinition<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface OptionalParamDefinition<T> extends ParamDefinition<T> {
  defaultValue: T
  isOptional: true
}

export interface ParamDefinitionsMap {
  [paramName: string]: ParamDefinitionAny
}

export type ParamDefinitions = {
  [param in keyof Required<RuntimeArgs>]: OptionalParamDefinition<
  RuntimeArgs[param]
  >;
};

export interface ShortParamSubstitutions {
  [name: string]: string
}

export interface TaskDefinition extends ConfigurableTaskDefinition {
  readonly name: string
  readonly description?: string
  readonly action: ActionType<TaskArguments>
  readonly isInternal: boolean

  // TODO: Rename this to something better. It doesn't include the positional
  // params, and that's not clear.
  readonly paramDefinitions: ParamDefinitionsMap

  readonly positionalParamDefinitions: ParamDefinitionAny[]
}

export interface TasksMap {
  [name: string]: TaskDefinition
}

export interface WasmkitRuntimeEnvironment {
  readonly config: ResolvedConfig
  readonly runtimeArgs: RuntimeArgs
  readonly tasks: TasksMap
  readonly run: RunTaskFunction
  readonly network: Network
}
// eslint-disable-next-line
export type PromiseAny = Promise<any>;

export interface StrMap {
  [key: string]: string
}

// schema related types

export type AnyJson =
  string | number | boolean | null | undefined | AnyJson[] | { [index: string]: AnyJson };

export type AnyFunction = (...args: any[]) => any; // eslint-disable-line  @typescript-eslint/no-explicit-any

export type AnyNumber = bigint | Uint8Array | number | string; // later add BN if big number is req

export type AnyString = string | string;

export type AnyU8a = Uint8Array | number[] | string;

export type ContractFunction<T = any> = ( // eslint-disable-line  @typescript-eslint/no-explicit-any
  ...args: any[] // eslint-disable-line  @typescript-eslint/no-explicit-any
) => Promise<T>;

// playground creation related
export interface Property {
  name: string
  type: string
  modifiers?: string[]
}

export interface Structure {
  kind: string
  name: string
  properties?: Property[]
}

export interface ContractListInfo {
  chainId: string |undefined
  codeId: number | undefined
  contractAddress: string |undefined
}
