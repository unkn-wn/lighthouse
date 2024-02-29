export const PARKING = {
  GARAGE: 0,
  LOT: 1,
  STREET: 2
};

export function getParkingName(number) {
  const parkingNames = Object.keys(PARKING);
  for (let i = 0; i < parkingNames.length; i++) {
    if (PARKING[parkingNames[i]] === number) {
      return parkingNames[i];
    }
  }
  return null;
}