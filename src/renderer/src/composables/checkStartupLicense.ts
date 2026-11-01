interface LicenseResponse {
  license?: boolean
  [key: string]: unknown
}

type StartupLicenseResult =
  | { status: 'missing-license' }
  | { status: 'missing-serial' }
  | { status: 'verified'; data: LicenseResponse }

// Do not contact the license server until there are credentials to verify.
export async function checkStartupLicense(
  getLicenseKey: () => Promise<string>,
  getSerialId: () => Promise<string>,
  verify: () => Promise<LicenseResponse>
): Promise<StartupLicenseResult> {
  if (!(await getLicenseKey())) return { status: 'missing-license' }
  if (!(await getSerialId())) return { status: 'missing-serial' }
  const data = await verify()
  if (!data) throw new Error('Invalid response from server')
  return { status: 'verified', data }
}
