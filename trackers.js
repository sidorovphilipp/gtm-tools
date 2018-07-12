/**
 * Вывести имена всех созданных трекеров.
 */

ga(function(tracker) {
  for (var i = 0; i<ga.getAll().length; i++){
    console.log(ga.getAll()[i].get('name'))
  }
})
