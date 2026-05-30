fetch('https://wandbox.org/api/list.json')
  .then(res => res.json())
  .then(data => {
    const py = data.find(c => c.language === 'Python');
    const js = data.find(c => c.language === 'JavaScript');
    console.log('Python compiler:', py ? py.name : 'Not found');
    console.log('JS compiler:', js ? js.name : 'Not found');
  }).catch(console.error);
