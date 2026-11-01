export interface CpuTimes {
  user: number
  nice: number
  sys: number
  idle: number
  irq: number
}

export interface CpuInfo {
  model: string
  speed: number
  times: CpuTimes
}

export interface NetworkAddress {
  address: string
  netmask: string
  family: 'IPv4' | 'IPv6'
  mac: string
  internal: boolean
  cidr: string
  scopeid?: number
}

export interface NetworkInterfaces {
  [interfaceName: string]: NetworkAddress[]
}

export interface SystemInfo {
  hostname: string
  platform: string
  arch: string
  release: string
  totalMemory: number
  freeMemory: number
  cpus: CpuInfo[]
  networkInterfaces: NetworkInterfaces
}
