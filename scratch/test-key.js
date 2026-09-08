import ConvertAPI from 'convertapi';
const convertapi = new ConvertAPI('0W8r0SZhlXEAdflpWPVLqhykhyuHGb2t');
convertapi.getUser().then(result => {
  console.log("SUCCESS! User data:", result);
}).catch(err => {
  console.log("FAILED:", err.message);
});
