const rp = require('request-promise');
const URL = 'http://planzajec.uek.krakow.pl/index.php?typ=G&id=190301&okres=1&fbclid=IwAR2ejJ2e87Dy2QNG7I73E0Jfpc4gmTX3NlFBaMRnUIRR7C3yLZk6s4XzBFI';
const [LECTURE, CLASSES, FOREIGN] = [
  'wykład',
  'ćwiczenia',
  'lektorat'
];
const FOREIGN_LANG_DAY = 'Cz' // Pn, Wt, Cz

const getClasses = () => {

  return rp(URL)
    .then((html) => {

      const reg = /<tr class="">.*<\/tr>/gs;
      const regSubject = />(.*?)</gm;
      const regTime = /(\d{2}:\d{2}) - (\d{2}:\d{2})/;

      const facultiesArray = html.match(reg)[0].split('</tr>');
      const classes = facultiesArray.slice(0, facultiesArray.length - 1);

      return classes.map(subject => {
        const cutSubject = subject.split(regSubject);
        const [
          date,
          time,
          name,
          description,
          person,
          location
        ] = [
            cutSubject[1],
            cutSubject[3],
            cutSubject[5],
            cutSubject[7],
            cutSubject[9],
            cutSubject[cutSubject.length - 2]
          ];
        const adjustedTime = time.split(regTime);
        const [startTime, endTime] = [adjustedTime[1], adjustedTime[2]]
        const eventColor = description.includes(LECTURE)
          ? 2
          : description.includes(CLASSES)
            ? 4
            : 5;
        
        // if (description.includes(FOREIGN) && !time.includes(FOREIGN_LANG_DAY)) {console.log(startTime, endTime, name)};
        return {
          'summary': name,
          'location': location,
          'description': `${description} ${person}`,
          'colorId': `${eventColor}`,
          'start': {
            'dateTime': `${date}T${startTime}:00.000`,
            'timeZone': 'Europe/Warsaw'
          },
          'end': {
            'dateTime': `${date}T${endTime}:00.000`,
            'timeZone': 'Europe/Warsaw'
          },
          'recurrence': [],
          'attendees': [],
          'reminders': {
            'useDefault': false,
            'overrides': [],
          },
        };

      })
    })
    .then(classes => classes)
    .catch((err) => console.log(err));
}

module.exports = getClasses;
