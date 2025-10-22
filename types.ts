
export enum LookupType {
  Mobile = 'mobile',
  Aadhaar = 'aadhaar',
  FamilyInfo = 'family-info',
  GST = 'gst',
  Telegram = 'tg',
  Vehicle = 'vehicle',
  IFSC = 'ifsc',
  BulkMobile = 'bulk-mobile',
  BulkAadhaar = 'bulk-aadhaar',
}

export interface HistoryItem {
  id: number;
  type: LookupType;
  value: string;
  result: string;
  timestamp: string;
  isBulk?: boolean;
}

export interface Stats {
  total: number;
  successful: number;
  responseTime: number;
}

// Type for the new Family Info API
export interface FamilyInfoResponse {
  address: string;
  allowed_onorc: string;
  districtCode: string;
  dup_uid_status: string;
  fpsId: string;
  homeDistName: string;
  homeStateCode: string;
  homeStateName: string;
  memberDetailsList: FamilyMember[];
  rcId: string;
  schemeId: string;
  schemeName: string;
}

export interface FamilyMember {
  memberId: string;
  memberName: string;
  relationship_code: string;
  releationship_name: string;
  uid: string;
}
