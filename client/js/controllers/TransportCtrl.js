/*global homeDashboard*/
/*global moment*/

(function() {
    'use strict';
    var TransportCtrl = function($timeout, transportService) {
      this.timeout = $timeout;

      this.transportService = transportService;

      this.transportationUpdateFrequency = 5; //minutes
      this.barUpdateFrequency = 1; //sekunder

      this.timeFormat = 'HH:mm:ss';
      this.transportTimers = [
        {dest: 't-centralen', station: 'vreten', type: 'metro', departures: []},
        {dest: 'hjulsta', station: 'vreten', type: 'metro', departures: []},
        {dest: 'alvik', station: 'johannesfred', type: 'tram', departures: []},
        {dest: 'solna c', station: 'johannesfred', type: 'tram', departures: []},
        {dest: 'alvik', station: 'johannesfred', type: 'bus', departures: []},
        {dest: 'danderyd', station: 'voltavagen', type: 'bus', departures: []}
      ];

      this.getTransportInfo();
      this.update();
      this.updateBars();
    };

    TransportCtrl.prototype.update = function() {
        this.timeout(function () {
          this.getTransportInfo();
          this.update();
        }.bind(this), 60000 * this.transportationUpdateFrequency);
    };

    TransportCtrl.prototype.updateBars = function() {
      this.timeout(function () {
        this.getCurrentTime();
        this.clearSchedule();
        this.updateBars();
      }.bind(this), 1000 * this.barUpdateFrequency);
    };

    TransportCtrl.prototype.clearSchedule = function() {
        for (var i = 0; i < this.transportTimers.length; i++) {
            var time = this.getTimeDifferenceSeconds(this.transportTimers[i].departures[1], this.getCurrentTime());
            if (time > 0) {
                this.transportTimers[i].departures.shift();
            }
        }
    };

    TransportCtrl.prototype.getTimeLeft = function(index) {
        return this.getTimeDifference(this.getCurrentTime(), this.transportTimers[index].departures[1]);
    };

    TransportCtrl.prototype.getCurrentTime = function() {
        return moment().add(6, 'hours').format(this.timeFormat);
    };

    TransportCtrl.prototype.getTimeDifferenceSeconds = function(firstTime, secondTime) {
        if (firstTime && secondTime) {
          var timeSplit1 = firstTime.split(':');
          var timeSplit2 = secondTime.split(':');
          var a = moment([2001, 0, 28, timeSplit1[0], timeSplit1[1], timeSplit1[2]]);
          var b = moment([2001, 0, 28, timeSplit2[0], timeSplit2[1], timeSplit2[2]]);
          return b.diff(a, 'seconds');
        }
    };

    TransportCtrl.prototype.getTimeDifference = function(firstTime, secondTime) {
        return moment.utc(moment(secondTime, this.timeFormat).diff(moment(firstTime,this.timeFormat))).format(this.timeFormat);
    };

    TransportCtrl.prototype.getPercentage = function(index) {
        var totalTime = this.getTimeDifferenceSeconds(this.transportTimers[index].departures[0], this.transportTimers[index].departures[1]);
        var remainingTime = this.getTimeDifferenceSeconds(this.getCurrentTime(), this.transportTimers[index].departures[1]);
        var percentage = 100 - ((remainingTime/totalTime) * 100);
        return percentage;
    };

    TransportCtrl.prototype.getTransportInfo = function() {
        for (var j = 0; j < this.transportTimers.length; j++) {
            this.transportService.loadTransportInfo(this.transportTimers[j].dest, this.transportTimers[j].station, this.transportTimers[j].type, function (j) {
              var data = this.transportService.getTransportInfo();
              if (this.transportTimers[j].departures.length < 1) {
                  this.transportTimers[j].departures.push(this.getCurrentTime());
              }
              for (var i = 0; i < data.Trip.length; i++) {
                var departure = '';
                if (data.Trip[i].LegList.Leg.constructor !== Array) {
                  departure = data.Trip[i].LegList.Leg.Origin.time;
                    if (this.transportTimers[j].departures.indexOf(departure) === -1) {
                        this.transportTimers[j].departures.push(departure);
                    }
                }
                else {
                    departure = data.Trip[i].LegList.Leg[j].Origin.time;
                    if (this.transportTimers[j].departures.indexOf(departure) === -1) {
                      this.transportTimers[j].departures.push(departure);
                    }
                }
              }
              //window.console.log(this.transportTimers);
            }.bind(this, j));
        }
    };
    homeDashboard.controller('TransportCtrl', TransportCtrl);
}());
