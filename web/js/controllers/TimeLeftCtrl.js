/*global homeDashboard*/

(function() {
  'use strict';
  var TimeLeftCtrl = function(timeLeftService) {
    this.timeLeftService = timeLeftService;

    this.title = '...tills Vickans semester.';
    this.startDate = '20150624';
    this.endDate = '20150717';
  };

  TimeLeftCtrl.prototype.getDaysPassed = function() {
    return this.timeLeftService.getDaysPassed(this.startDate);
  };

  TimeLeftCtrl.prototype.getDaysBetween = function() {
    return this.timeLeftService.getDaysBetween(this.startDate, this.endDate);
  };

  TimeLeftCtrl.prototype.getPercentageLeft = function() {
    var daysPassed = this.getDaysPassed();
    var daysTotal = this.getDaysBetween();

    return (daysPassed/daysTotal)*100;
  };

  homeDashboard.controller('TimeLeftCtrl', TimeLeftCtrl);
}());
