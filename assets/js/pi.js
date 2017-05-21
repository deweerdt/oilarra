$(function() {

    pi.init();

    $('.button-group').on('click', '#all.off', function(){
        $.ajax({
            type: 'PUT',
            url: urls.group0onoff,
            data: '{"on": true, "bri": 100}'
        });
    });

    $('.button-group').on('click', '#all.on', function(){
        $.ajax({
            type: 'PUT',
            url: urls.group0onoff,
            data: '{"on": false}'
        });
    });

    $('#brightness-less').on('click', function(){
        $(this).removeClass('on');
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: urls.brightness,
            data: '{"brightness": "less"}'
        });
    });

    $('#brightness-more').on('click', function(){
        $(this).removeClass('on');
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: urls.brightness,
            data: '{"brightness": "more"}'
        });
    });

});

var ds = oilarra.dark_sky;
var urls = {
    'api':            'http://[HUEIP]/api/[HUEUSER]/lights/',
    'group0onoff':    'http://[HUEIP]/api/[HUEUSER]/groups/0/action',
    'group0state':    'http://[HUEIP]/api/[HUEUSER]/groups/0/',
    'sensor':        'http://[HUEIP]/api/[HUEUSER]/sensors/22',
    'bedonoff':        'http://[HUEIP]/api/[HUEUSER]/groups/6/action',
    'bedstate':        'http://[HUEIP]/api/[HUEUSER]/groups/6/',
    'brightness':   '/brightness',
    'weatherData':    'https://api.darksky.net/forecast/'+ds.api_key+'/'+ds.longitude+','+ds.latitude+'?units='+ds.units+'&callback=?'
}
var moons = {
    'new':        '<i class="wi wi-moon-alt-new"></i> New Moon',
    'waxc1':    '<i class="wi wi-moon-alt-waxing-crescent-1"></i> Waxing Crescent',
    'waxc2':    '<i class="wi wi-moon-alt-waxing-crescent-2"></i> Waxing Crescent',
    'waxc3':    '<i class="wi wi-moon-alt-waxing-crescent-3"></i> Waxing Crescent',
    'waxc4':    '<i class="wi wi-moon-alt-waxing-crescent-4"></i> Waxing Crescent',
    'waxc5':    '<i class="wi wi-moon-alt-waxing-crescent-5"></i> Waxing Crescent',
    'waxc6':    '<i class="wi wi-moon-alt-waxing-crescent-6"></i> Waxing Crescent',
    'quarter1':    '<i class="wi wi-moon-alt-first-quarter"></i> First Quarter',
    'waxg1':    '<i class="wi wi-moon-alt-waxing-gibbous-1"></i> Waxing Gibbous',
    'waxg2':    '<i class="wi wi-moon-alt-waxing-gibbous-2"></i> Waxing Gibbous',
    'waxg3':    '<i class="wi wi-moon-alt-waxing-gibbous-3"></i> Waxing Gibbous',
    'waxg4':    '<i class="wi wi-moon-alt-waxing-gibbous-4"></i> Waxing Gibbous',
    'waxg5':    '<i class="wi wi-moon-alt-waxing-gibbous-5"></i> Waxing Gibbous',
    'waxg6':    '<i class="wi wi-moon-alt-waxing-gibbous-6"></i> Waxing Gibbous',
    'full':        '<i class="wi wi-moon-alt-full"></i> Full Moon',
    'wang1':    '<i class="wi wi-moon-alt-waning-gibbous-1"></i> Waning Gibbous',
    'wang2':    '<i class="wi wi-moon-alt-waning-gibbous-2"></i> Waning Gibbous',
    'wang3':    '<i class="wi wi-moon-alt-waning-gibbous-3"></i> Waning Gibbous',
    'wang4':    '<i class="wi wi-moon-alt-waning-gibbous-4"></i> Waning Gibbous',
    'wang5':    '<i class="wi wi-moon-alt-waning-gibbous-5"></i> Waning Gibbous',
    'wang6':    '<i class="wi wi-moon-alt-waning-gibbous-6"></i> Waning Gibbous',
    'quarter2':    '<i class="wi wi-moon-alt-third-quarter"></i> Last Quarter',
    'wanc1':    '<i class="wi wi-moon-alt-waning-crescent-1"></i> Waning Crescent',
    'wanc2':    '<i class="wi wi-moon-alt-waning-crescent-2"></i> Waning Crescent',
    'wanc3':    '<i class="wi wi-moon-alt-waning-crescent-3"></i> Waning Crescent',
    'wanc4':    '<i class="wi wi-moon-alt-waning-crescent-4"></i> Waning Crescent',
    'wanc5':    '<i class="wi wi-moon-alt-waning-crescent-5"></i> Waning Crescent',
    'wanc6':    '<i class="wi wi-moon-alt-waning-crescent-6"></i> Waning Crescent',
}

var pi = {
    init: function() {
        window.addEventListener('contextmenu', function(e) { e.preventDefault(); })
        pi.time();
        pi.weather();
        pi.hue();
        setInterval( function() {
            pi.hue();
        }, 2000);
        setInterval( function() {
            pi.weather();
        }, 3600000);
    },
    time: function() {
        setInterval( function() {
            $('#time').html(moment().format('HH:mm')).attr('datetime', moment().format('HHmm')).append('<span>'+moment().format('dddd Do MMMM, YYYY')+'</span>');
            pi.daynight();
        }, 1000);
    },
    daynight: function() {
        if($('#time').attr('datetime') > moment.unix(pi.sunrise).format('HHMM') && $('#time').attr('datetime') < moment.unix(pi.sunset).format('HHMM')) {
            $('body').removeClass('night').addClass('day');
            $('.button').removeClass('hollow');
        } else {
            $('body').removeClass('day').addClass('night');
            $('.button').addClass('hollow');
        }
    },
    weather: function() {
        var ds_to_icon = function (icon) {
            if(icon == 'clear-day') {return 'wi-day-sunny'};
            if(icon == 'clear-night') {return 'wi-night-clear'};
            if(icon == 'rain' && $('body').hasClass('day')) {return 'wi-day-showers'};
            if(icon == 'rain' && $('body').hasClass('night')) {return 'wi-night-alt-showers'};
            if(icon == 'snow') {return 'wi-snow'};
            if(icon == 'sleet') {return 'wi-sleet'};
            if(icon == 'wind') {return 'wi-strong-wind'};
            if(icon == 'fog') {return 'wi-fog'};
            if(icon == 'cloudy') {return 'wi-cloudy'};
            if(icon == 'partly-cloudy-day') {return 'wi-day-cloudy-high'};
            if(icon == 'partly-cloudy-night') {return 'wi-night-alt-cloudy'};
            if(icon == 'hail') {return 'wi-day-hail'};
            if(icon == 'thunderstorm') {return 'wi-thunderstorm'};
            if(icon == 'tornado') {return 'wi-tornado'};
            return icon;
        };

        $.getJSON(urls.weatherData, function(weather){

            var summary = weather.currently.summary,
                num = weather.currently.cloudCover,
                moon = weather.daily.data[0].moonPhase,
                sunrise = weather.daily.data[0].sunriseTime,
                sunset = weather.daily.data[0].sunsetTime,
                now = weather.hourly.summary,
                pred = '',
                moonPhase = '';
            summaryIcon = ds_to_icon(weather.currently.icon);
            pi.sunrise = sunrise;
            pi.sunset = sunset;
            if(num == 0) {var text = 'Clear', cIcon = 'wi-clear-day'};
            if(num > 0 && num <= 0.4) {var text = 'Scattered Clouds', cIcon = 'wi-day-cloudy-high'};
            if(num >= 0.41 && num <= 0.75) {var text = 'Broken Clouds', cIcon = 'wi-cloudy'};
            if(num >= 0.76 && num <= 1) {var text = 'Overcast', cIcon = 'wi-day-sunny-overcast'};
            if(moon => 0.99 && moon <= 0.01) {moonPhase = moons.new};
            if(moon > 0.01 && moon < 0.05) {moonPhase = moons.waxc1};
            if(moon > 0.06 && moon < 0.10) {moonPhase = moons.waxc2};
            if(moon > 0.10 && moon < 0.14) {moonPhase = moons.waxc3};
            if(moon > 0.14 && moon < 0.18) {moonPhase = moons.waxc4};
            if(moon > 0.18 && moon < 0.22) {moonPhase = moons.waxc5};
            if(moon > 0.22 && moon < 0.25) {moonPhase = moons.waxc6};
            if(moon == 0.25) {moonPhase = moons.quarter1};
            if(moon > 0.25 && moon < 0.29) {moonPhase = moons.waxg1};
            if(moon >= 0.29 && moon < 0.33) {moonPhase = moons.waxg2};
            if(moon >= 0.33 && moon < 0.37) {moonPhase = moons.waxg3};
            if(moon >= 0.37 && moon < 0.41) {moonPhase = moons.waxg4};
            if(moon >= 0.41 && moon < 0.45) {moonPhase = moons.waxg5};
            if(moon >= 0.45 && moon < 0.49) {moonPhase = moons.waxg6};
            if(moon == 0.5) {moonPhase = moons.full};
            if(moon > 0.5 && moon < 0.54) {moonPhase = moons.wang1};
            if(moon >= 0.54 && moon < 0.58) {moonPhase = moons.wang2};
            if(moon >= 0.58 && moon < 0.62) {moonPhase = moons.wang3};
            if(moon >= 0.62 && moon < 0.66) {moonPhase = moons.wang4};
            if(moon >= 0.66 && moon < 0.70) {moonPhase = moons.wang5};
            if(moon >= 0.70 && moon < 0.75) {moonPhase = moons.wang6};
            if(moon == 0.75) {moonPhase = moons.quarter2};
            if(moon > 0.75 && moon < 0.79) {moonPhase = moons.wanc1};
            if(moon >= 0.79 && moon < 0.83) {moonPhase = moons.wanc2};
            if(moon >= 0.83 && moon < 0.87) {moonPhase = moons.wanc3};
            if(moon >= 0.87 && moon < 0.91) {moonPhase = moons.wanc4};
            if(moon >= 0.91 && moon < 0.95) {moonPhase = moons.wanc5};
            if(moon >= 0.95 && moon < 0.99) {moonPhase = moons.wanc6};

            pred += '<dt><i class="wi '+summaryIcon+'"></i>&nbsp;'+ summary + '</dt>';
            pred += '<dt><hr/></dt>';
            pred += '<dd>'+ now + '</dd>';
            pred += '<dt><hr/></dt>';

            pred += '<dt><i class="wi wi-thermometer"></i> ' + weather.currently.temperature+'<i class="wi wi-celsius"></i> <small>(Feels like '+weather.currently.apparentTemperature+'<i class="wi wi-celsius"></i>)</small></dt>';

            pred += '<dd>Max: '+weather.daily.data[0].temperatureMax+'<i class="wi wi-celsius"></i> | Min: '+weather.daily.data[0].temperatureMin+'<i class="wi wi-celsius"></i></dd>';
            pred += '<dt><hr/></dt>';

            pred += '<dt><i class="wi wi-strong-wind"></i> Wind: <i class="wi wi-wind towards-'+weather.currently.windBearing+'-deg"></i> '+degToCompass(weather.currently.windBearing)+' '+weather.currently.windSpeed+' mph</dt>';
            pred += '<dt><i class="wi '+cIcon+'"></i> '+ text + '</dt>';

            if(weather.currently.precipIntensity > 0) {
                pred += '<dt><i class="wi wi-rain"></i> Rain: '+Math.round(weather.currently.precipProbability * 100, 2)+'% '+Math.round(weather.currently.precipIntensity * 10, 2)+'mm/hr '+weather.currently.precipType+'</dt>';
            } else {
                pred += '<dt><i class="wi wi-umbrella"></i> Rain: '+Math.round(weather.currently.precipProbability * 100, 2)+'%</dt>';
            }

            if(weather.currently.nearestStormDistance > 0) {
                pred += '<dt>Nearest rain: <i class="wi wi-wind towards-'+weather.currently.nearestStormBearing+'-deg"></i> '+degToCompass(weather.currently.nearestStormBearing)+' '+weather.currently.nearestStormDistance+' miles</dt>';
            }

            pred += '<dt><i class="wi wi-humidity"></i> Humidity: ' + Math.round(weather.currently.humidity * 100) + '%</dt>';

            if(exists(weather.daily.data[0].moonPhase)) {
                pred += '<dt>'+moonPhase+'</dt>';
            }

            pred += '<dt><i class="wi wi-sunrise"></i> '+moment.unix(pi.sunrise).format('HH:mm a')+' | <i class="wi wi-sunset"></i> '+moment.unix(pi.sunset).format('HH:mm a')+'</dt>';
            pred += '<dt><small>weather data <i class="wi wi-time-3"></i> '+moment.unix(weather.currently.time).format('h:mm a')+'</small></dt>';
            var week_pred = "";
            for (var i in weather.daily.data) {
                var day = weather.daily.data[i];
                week_pred += '<dt><small>'+moment.unix(day.time).format('dd')+'</small>&nbsp;<i class="wi '+ds_to_icon(day.icon)+'"></i>&nbsp;<small>'+parseInt(day.temperatureMin)+'-'+parseInt(day.temperatureMax)+'</small></dt>';
            }

            $('#weather_week').html(week_pred);
            $('#weather').html(pred);

        });
    },
    hue: function() {
        $.getJSON(urls.group0state, function(all){

            $.getJSON(urls.bedstate, function(bed){

                if(all.state.all_on == true && all.state.any_on == true && bed.state.all_on == true && bed.state.any_on == true) {
                    $('#all').addClass('on');
                    $('#bed').addClass('on');
                }
                if(all.state.all_on == false && all.state.any_on == true && bed.state.all_on == true && bed.state.any_on == true) {
                    $('#all').addClass('on');
                    $('#bed').addClass('on');
                }
                if(all.state.all_on == false && all.state.any_on == true && bed.state.all_on == false && bed.state.any_on == true) {
                    $('#all').addClass('on');
                    $('#bed').addClass('on');
                }
                if(all.state.all_on == false && all.state.any_on == true && bed.state.all_on == false && bed.state.any_on == false) {
                    $('#bed').removeClass('on');
                    $('#all').addClass('on');
                }
                if(all.state.all_on == false && all.state.any_on == false) {
                    $('#all').removeClass('on');
                }
                if(bed.state.all_on == false && bed.state.any_on == false) {
                    $('#bed').removeClass('on');
                }

            });

        });

    }

}

function exists(data) {

    if(!data || data==null || data=='undefined' || typeof(data)=='undefined') return false;
    else return true;

}

function degToCompass(num) {

    var val = Math.floor((num / 22.5) + 0.5);
    var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
}
