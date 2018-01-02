'use strict';
import { get } from './utils';

export const nope = '--';
export const na = 'N/A';
export const invalid = 'Invalid';

// Ie. given 12345.99, return '12,346'
export const commaSeparatedNumber = (x) => {
  // isNaN(null) === true :*(
  if (isNaN(x) || (!x && x !== 0)) {
    return nope;
  }
  return Math.round(Number(x)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export function percent (value, total, decimals = 2) {
  let val = value / total * 100;
  return round(val, decimals);
}

export function round (value, decimals = 2) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function shortenLargeNumber (value, decimals = 2) {
  if (value / 1e9 >= 1) {
    value = round(value / 1e9, decimals) + 'B';
  } else if (value / 1e6 >= 1) {
    value = round(value / 1e6, decimals) + 'M';
  }
  return value;
}

// Ie. given 'MadDogIndustries', return 'Mad Dog Industries'
export const separateUppercaseWords = (x) => {
  if (typeof x !== 'string') {
    return nope;
  }
  return x.replace(/([A-Z])/g, ' $1').trim();
};

// Ie. given 'SCRT', return 'Secretariat'.
const organizationCodeToDisplay = {
  'NTLS': 'National Society',
  'DLGN': 'Delegation',
  'SCRT': 'Secretariat',
  'ICRC': 'ICRC',
  'OTHR': 'Other'
};
export const organizationType = (code) => organizationCodeToDisplay[code] || invalid;

export const uppercaseFirstLetter = (str) => {
  const s = str.toString();
  return s.slice(0, 1).toUpperCase() + s.slice(1, s.length).toLowerCase();
};

// Ie. given 'user.username', return 'username'.
export const getPropertyFromPath = (path) => {
  const parts = path.split('.');
  return parts[parts.length - 1];
};

// Ie. given 'user.username', return 'Username'.
// This will console.warn if a match isn't found.
const apiPropertyToDisplay = {
  'username': 'Username',
  'email': 'Email',
  'first_name': 'First Name',
  'last_name': 'Last Name',
  'city': 'City',
  'org': 'Organization',
  'org_type': 'Organization Type',
  'department': 'Department',
  'position': 'Position',
  'phone_number': 'Phone Number'
};
export const apiPropertyDisplay = (propOrPath) => {
  const propertyName = getPropertyFromPath(propOrPath);
  const display = apiPropertyToDisplay[propertyName];
  if (!display) {
    console.warn('No display found for', propertyName);
    return propertyName;
  }
  return display;
};

// Ie. given ('org', { org: 'NATL' }) return 'National Society'.
const apiPropertyFormatters = {
  'org_type': organizationType
};
export const apiPropertyValue = (propOrPath, object) => {
  const value = get(object, propOrPath);
  if (typeof value === 'undefined') {
    return nope;
  }
  const propertyName = getPropertyFromPath(propOrPath);
  const formatter = apiPropertyFormatters[propertyName];
  if (!formatter) {
    return value;
  }
  return formatter(value);
};

export const drefDefinition = {
  1: 'Requested',
  2: 'Planned',
  3: 'Deployed'
};

export const appealDefinition = {
  1: 'Requested',
  2: 'Planned',
  3: 'Active'
};

export const bulletinDefinition = {
  1: 'Requested',
  2: 'Planned',
  3: 'Published'
};

export const deployDefinition = {
  1: 'Requested',
  2: 'Planned',
  3: 'Deployed'
};

export const getResponseStatus = (data, dataPath) => {
  const status = get(data, dataPath, null);
  if (status === null || status === 0) { return null; }
  switch (getPropertyFromPath(dataPath)) {
    case 'dref':
      return drefDefinition[status];
    case 'appeal':
      return appealDefinition[status];
    case 'bulletin':
      return bulletinDefinition[status];
    case 'rdrt':
    case 'fact':
    case 'ifrc_staff':
    default:
      return deployDefinition[status];
  }
};
