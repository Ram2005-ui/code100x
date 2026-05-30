fetch('https://wandbox.org/api/list.json')
  .then(res => res.json())
  .then(data => {
    const cpp = data.find(c => c.language === 'C++');
    const java = data.find(c => c.language === 'Java');
    console.log('C++ compiler:', cpp.name);
    console.log('Java compiler:', java.name);
  }).catch(console.error);
