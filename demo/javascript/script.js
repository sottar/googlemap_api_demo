"use strict";

createMap();
/* map表示処理 */
function createMap() {
  var $cassette = $('.item');
  var mapPin = new Array(); // mapに表示されるpin
  var stationListWidth = $('.block').width(); // 駅リストの横幅を取得

  // mapPinの値を設定
  $cassette.each(function (i) {
    mapPin.push({
      'latitude': Number($(this).attr('lat')),
      'longitude': Number($(this).attr('lng')),
      'stationName': $(this).children('.title').text(),
      'stationId': $(this).attr('id'),
      'linkUrl': $(this).children('a').attr('href')
    });

    // $cassetteマウスオーバー時
    $(this).hover(function () {
      if (markerObj && displayingMarker != markerObj[i]) {
        disableActive();
        activeMarker(i);
        displayInfoWindow(i);
        var latlng = new google.maps.LatLng(mapPin[i].latitude, mapPin[i].longitude);
        map.panTo(latlng);
        map.panBy(-stationListWidth / 2, 0);
      }
    });
  });

  // mapのインスタンスを生成
  var map = new google.maps.Map(document.getElementById('googlemap'));

  // map の表示範囲を設定
  var minLat = void 0,
      maxLat = void 0,
      minLng = void 0,
      maxLng = void 0;
  for (var i = 0, len = mapPin.length; i < len; i++) {
    if (i == 0) {
      minLat = mapPin[i].latitude;
      maxLat = mapPin[i].latitude;
      minLng = mapPin[i].longitude;
      maxLng = mapPin[i].longitude;
    } else {
      minLat = getSmallNum(minLat, mapPin[i].latitude);
      maxLat = getLargeNum(maxLat, mapPin[i].latitude);
      minLng = getSmallNum(minLng, mapPin[i].longitude);
      maxLng = getLargeNum(maxLng, mapPin[i].longitude);
    }
  }
  var sw = new google.maps.LatLng(maxLat, minLng);
  var ne = new google.maps.LatLng(minLat, maxLng);
  var bounds = new google.maps.LatLngBounds(sw, ne);
  map.fitBounds(bounds);
  map.panBy(-stationListWidth / 2, 0);

  // mapPinごとにmarker, infoWindowのインスタンスを生成
  var markerObj = [];
  var infoWindow = [];
  for (var _i = 0, _len = mapPin.length; _i < _len; _i++) {
    // marker
    markerObj[_i] = new google.maps.Marker({
      position: new google.maps.LatLng({ lat: mapPin[_i]['latitude'], lng: mapPin[_i]['longitude'] }),
      map: map,
      zIndex: 1,
      icon: {
        url: './img/marker_default.png',
        scaledSize: new google.maps.Size(20, 20)
      },
      stationId: mapPin[_i].stationId
    });
    // infoWindow
    var ballon = '<div width="150px">';
    ballon += '<div style="float:left;width:100%;margin-left:5px;">';
    ballon += '<a href="#">' + mapPin[_i]['stationName'] + '</a>';
    ballon += '</div></div>';
    infoWindow[_i] = new google.maps.InfoWindow({
      content: ballon
    });

    // infoWindowを閉じた時の挙動を設定
    google.maps.event.addListener(infoWindow[_i], 'closeclick', function () {
      disableActive();
    });
    markerEvent(_i);
  }

  // mapPinクリック時の挙動を設定
  function markerEvent(i) {
    markerObj[i].addListener('click', function () {
      if (markerObj && displayingMarker != markerObj[i]) {
        openInfoWindow(i);
        var latlng = new google.maps.LatLng(mapPin[i].latitude, mapPin[i].longitude);
        map.panTo(latlng);
        if (isOpened()) {
          map.panBy(-stationListWidth / 2, 0);
        }
      }
      var targetPosition = $('#' + markerObj[i].stationId).position().top;
      var scrollValue = $('.block').scrollTop();
      var range = Number(targetPosition) + Number(scrollValue);
      $('.block').animate({
        scrollTop: range
      });
    });
  }

  // infoWindowを表示する
  var openInfoWindow = function openInfoWindow(num) {
    // 表示中のinfoWindow, markerがあれば削除
    disableActive();

    //markerをactiveにする
    activeMarker(num);

    // infoWindowを表示
    displayInfoWindow(num);
  };

  // マーカーをアクティブにする
  var activeMarker = function activeMarker(num) {
    markerObj[num].setOptions({
      zIndex: 2,
      icon: {
        url: './img/marker_active.png'
      }
    });
    displayingMarker = markerObj[num];
  };
  // InfoWindowを表示する
  var displayInfoWindow = function displayInfoWindow(num) {
    infoWindow[num].open(map, markerObj[num]);
    displayingWindow = infoWindow[num];
  };
  // 表示中のinfoWindow, marker
  var displayingWindow = null;
  var displayingMarker = null;

  $('.list_anchor').click(function () {
    if (isOpened()) {
      closeStationList();
    } else {
      openStationList();
    }
  });

  // 駅リストを閉じる
  var closeStationList = function closeStationList() {
    $('.list_anchor').removeClass('opened').addClass('closed');
    $('.fa').removeClass('fa-caret-left').addClass('fa-caret-right');
    $('.wrapper').animate({
      left: '-400px'
    }, 500);
    // map.panTo(displayingMarker.getPosition());
    map.panBy(stationListWidth / 2, 0);
  };
  // 駅リストを開く 
  var openStationList = function openStationList() {
    $('.list_anchor').removeClass('closed').addClass('opened');
    $('.fa').removeClass('fa-caret-right').addClass('fa-caret-left');
    $('.wrapper').animate({
      left: '0px'
    }, 500);
    map.panTo(displayingMarker.getPosition());
    map.panBy(-stationListWidth / 2, 0);
  };

  // 表示中のinfoWindow, markerがあれば削除
  var disableActive = function disableActive() {
    if (displayingWindow) {
      displayingWindow.close();
    }
    if (displayingMarker) {
      displayingMarker.setOptions({
        zIndex: 1,
        icon: {
          url: './img/marker_default.png',
          scaledSize: new google.maps.Size(20, 20)
        }
      });
    }
    displayingWindow = null;
    displayingMarker = null;
  };

  // 企業リストが表示されているか
  var isOpened = function isOpened() {
    if ($('.list_anchor').hasClass('opened')) {
      return true;
    }
    return false;
  };
}

function getSmallNum(num1, num2) {
  return num1 < num2 ? num1 : num2;
};
function getLargeNum(num1, num2) {
  return num1 > num2 ? num1 : num2;
};

$('.item').on('click', function () {
  $('.item').removeClass('active');
  $(this).addClass('active');
});