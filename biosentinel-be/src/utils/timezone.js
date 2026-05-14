const dayjs = require('dayjs');

const utc = require('dayjs/plugin/utc');

const timezone =
  require('dayjs/plugin/timezone');

dayjs.extend(utc);

dayjs.extend(timezone);

const WIB_TIMEZONE =
  'Asia/Jakarta';

const convertWIBToUTC = (
  date
) => {

  return dayjs
    .tz(date, WIB_TIMEZONE)
    .utc()
    .toDate();

};

const convertUTCToWIB = (
  date
) => {

  return dayjs(date)
    .tz(WIB_TIMEZONE)
    .format('YYYY-MM-DD HH:mm:ss');

};

module.exports = {
  convertWIBToUTC,
  convertUTCToWIB
}; 