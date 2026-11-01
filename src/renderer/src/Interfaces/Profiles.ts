export interface Profiles {
    "employeeName": string,
    "photo": string,
    "employeeDesignation": string,
    "employeeId": string,
    "employeePhone": string,
    "EmployeeEmail": string,
    "created_at": string,
    "updated_at": string,
}

export interface CompanyInfos {
    "companyName": string,
    "Logo": string,
    "country": string,
    "state": string,
    "city": string,
    "addressLine": string,
    "zipCode": string,
    "tradeLicense": string,
    "phoneNumber": string,
    "emailAddress": string,
    "created_at": string,
    "webOrSlogan": string,
}
interface UpdateHistorys {
    "updated_at": string,
    "expire": string,
}
export interface Licenses {
    "update_history": UpdateHistorys[],
    "type": string,
    "key": string,
    "expire": string,
    "created_at": string,
    "updated_at": string,
    "updated_count": string,
}

// INTERFACES
export interface City {
    name: string
}

export interface State {
    name: string
    cities: City[]
}

export interface Country {
    name: string
    states: State[]
}

export interface Users {
  id: number;
  employeeName: string;
  photo: string | null;
  employeeDesignation: string;
  employeeId: string;
  employeePhone: string;
  EmployeeEmail: string;
  serial_number: string;
  host_name: string;
  os: string;
  ram: string;
  cpu: string;
  mac: string;
  access: boolean;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  company: number;
}