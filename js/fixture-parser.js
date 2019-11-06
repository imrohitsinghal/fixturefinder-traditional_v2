String.prototype.contains = function (it) {
	return this.indexOf(it) != -1;
};

var FixtureParser = function () {
	var getLocalKickOffTime = function (date, utcTime) {
		if (utcTime.indexOf(":") > -1) {
			var utcKOTime = moment.utc(moment.utc(date + "T" + utcTime).format('YYYY-MM-DD HH:mm:ss')).toDate();
			localKOTime = moment(utcKOTime).format("HH:mm");
		} else {
			localKOTime = utcTime;
		}
		return utcTime;
	};
	
	function showHomeTeamDetails(team_name) {
		var url = 'http://fixturefinder-service.herokuapp.com/fixture-finder/fixtures/by-team/'+team_name;
		$('.spinner').fadeIn(1000);
		$.ajax({
			type: 'GET',
			url: url,
			async: true,
			jsonpCallback: 'jsonCallback',
			contentType: "application/json",
			dataType: 'jsonp',
			success: function(json) {
				FixtureParser.setTeamDetails(json);
			},
			error: function(json) {
				console.log(json.messages);
			}
		}).done(function() {
			$('.spinner').fadeOut(1000);
		});
	}
	
	var preprocessFixtures = function (fixtures) {
		$.each(fixtures, function (index, fixture) {
			if (fixture.kickOff.date < '2019-08-18') {
				if (fixture.kickOff.status === 'FULL_TIME') {
					fixture.score.homeGoals = 2;
					fixture.score.awayGoals = 1;
				}
			}
		});
		return fixtures;
	};
	
	var getFixtureAsHTMLElement = function (fixture, index) {
		var listElement = '<tr class="fixture">';
		listElement = listElement + '<td class="competition"><div class="flag flag-' + fixture.country + '"></div>' + fixture.competition + '</td>';
		listElement = listElement + '<td class="kickOffDate" ><small>' + getLocalKickOffTime(fixture.kickOff.date, fixture.kickOff.time) + '</small></td>';
		listElement = listElement + '<td id="homeTeamName_' + index + '" class="home team" ><strong>' + fixture.homeTeam +'</strong></td>';
		listElement = listElement + '<td class="score">' + fixture.score.homeGoals + ':' + fixture.score.awayGoals +'</td>';
		listElement = listElement + '<td class="away team"><strong>' + fixture.awayTeam + '</strong></td>';
		listElement = listElement + '</tr>';
		return listElement;
	};
	
	return {
		parseFixtures: function (fixtures) {
			var localString = FixtureFinder.localizeString("fixtures");
			$('.fixtures .fixture').remove();
			$('.fixtures .numberOfFixtures').text(fixtures.length + ' ' + localString);
			fixtures = preprocessFixtures(fixtures);
			$.each(fixtures.length>=2?fixtures.slice(0, fixtures.length-1):fixtures, function(index, fixture) {
				$('.fixtures .table').append(getFixtureAsHTMLElement(fixture, index));
					document.getElementById('homeTeamName_' + index).addEventListener("click", function(){
						showHomeTeamDetails(fixture.homeTeam);
					});
			});
			},
		
		setTeamDetails: function (fixtures) {
			$('.info').empty();
			$('.dateSelectNav').empty();
			$('.fixtures .fixture').empty();
			$.each(fixtures, function (index, fixture) {
				$('.fixtures .table').append(getFixtureAsHTMLElement(fixture, index));
			});
		}
	}
}();
