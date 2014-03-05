exports.index = function(req, res) {
  res.render('home', {
    title: 'Mood music',
    mood: '',
  });
};
