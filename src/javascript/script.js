"use strict";

createMap();
/* map表示処理 */
function createMap() {
  const $cassette = $('.item');
  let mapPin = new Array; // mapに表示されるpin
  const stationListWidth = $('.block').width(); // 駅リストの横幅を取得

  // mapPinの値を設定
  $cassette.each(function(i) {
    mapPin.push({
      'latitude': Number($(this).attr('lat')),
      'longitude': Number($(this).attr('lng')),
      'stationName': $(this).children('.title').text(),
      'stationId': $(this).attr('id'),
      'linkUrl': $(this).children('a').attr('href'),
    });

    // $cassetteマウスオーバー時
    $(this).hover(() => {
      if (markerObj && displayingMarker != markerObj[i]) {
        disableActive();
        activeMarker(i);
        displayInfoWindow(i);
        let latlng = new google.maps.LatLng(mapPin[i].latitude, mapPin[i].longitude);
        map.panTo(latlng);
        map.panBy(-stationListWidth / 2, 0);
      }
    });
  });

  // mapのインスタンスを生成
  let map = new google.maps.Map(document.getElementById('googlemap'));

  // map の表示範囲を設定
  let minLat,
      maxLat,
      minLng,
      maxLng;
  for (let i = 0, len = mapPin.length; i < len; i++) {
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
  const sw = new google.maps.LatLng(maxLat,minLng);
  const ne = new google.maps.LatLng(minLat,maxLng);
  const bounds = new google.maps.LatLngBounds(sw, ne);
  map.fitBounds(bounds);
  map.panBy(-stationListWidth / 2, 0);

  // mapPinごとにmarker, infoWindowのインスタンスを生成
  let markerObj = [];
  let infoWindow = [];
  for (let i = 0, len = mapPin.length; i < len; i++) {
    // marker
    markerObj[i] = new google.maps.Marker({
      position: new google.maps.LatLng({lat: mapPin[i]['latitude'], lng: mapPin[i]['longitude']}),
      map: map,
      zIndex: 1,
      icon:{
        url: './img/marker_default.png',
        scaledSize: new google.maps.Size(20,20),
      },
      stationId: mapPin[i].stationId,
    });
    // infoWindow
    let ballon = '<div width="150px">';
    ballon += '<div style="float:left;width:100%;margin-left:5px;">';
    ballon += '<a href="#">' + mapPin[i]['stationName'] + '</a>';
    ballon += '</div></div>';
    infoWindow[i] = new google.maps.InfoWindow({
      content: ballon,
    });

    // infoWindowを閉じた時の挙動を設定
    google.maps.event.addListener(infoWindow[i] , 'closeclick' , () => {
      disableActive();
    });
    markerEvent(i);
  }

  // mapPinクリック時の挙動を設定
  function markerEvent(i) {
    markerObj[i].addListener('click', () => {
      if (markerObj && displayingMarker != markerObj[i]) {
        openInfoWindow(i);
        let latlng = new google.maps.LatLng(mapPin[i].latitude, mapPin[i].longitude);
        map.panTo(latlng);
        if (isOpened()) {
          map.panBy(-stationListWidth / 2, 0);
        }
      }
      const targetPosition = $('#' + markerObj[i].stationId).position().top;
      const scrollValue = $('.block').scrollTop();
      const range = Number(targetPosition) + Number(scrollValue);
      $('.block').animate({
        scrollTop: range, 
      })
    });
  }

  // infoWindowを表示する
  const openInfoWindow = (num) => {
    // 表示中のinfoWindow, markerがあれば削除
    disableActive();

    //markerをactiveにする
    activeMarker(num);

    // infoWindowを表示
    displayInfoWindow(num);
  }
  
  // マーカーをアクティブにする
  const activeMarker = (num) => {
    markerObj[num].setOptions({
      zIndex: 2,
      icon: {
        url: './img/marker_active.png',
      },
    });
    displayingMarker = markerObj[num];
  }
  // InfoWindowを表示する
  const displayInfoWindow = function(num) {
    infoWindow[num].open(map, markerObj[num]);
    displayingWindow = infoWindow[num];
  }
  // 表示中のinfoWindow, marker
  let displayingWindow = null;
  let displayingMarker = null;

  $('.list_anchor').click(() => {
    if (isOpened()) {
      closeStationList();
    } else {
      openStationList();
    }
  });

  // 駅リストを閉じる
  const closeStationList = () => {
    $('.list_anchor').removeClass('opened').addClass('closed');
    $('.fa').removeClass('fa-caret-left').addClass('fa-caret-right');
    $('.wrapper').animate({
      left: '-400px',
    }, 500)
    // map.panTo(displayingMarker.getPosition());
    map.panBy(stationListWidth / 2, 0);
  }
  // 駅リストを開く 
  const openStationList = () => {
    $('.list_anchor').removeClass('closed').addClass('opened');
    $('.fa').removeClass('fa-caret-right').addClass('fa-caret-left');
    $('.wrapper').animate({
      left: '0px',
    }, 500)
    map.panTo(displayingMarker.getPosition());
    map.panBy(-stationListWidth / 2, 0);
  }

  // 表示中のinfoWindow, markerがあれば削除
  const disableActive = () => {
    if (displayingWindow) {
      displayingWindow.close();
    }
    if (displayingMarker) {
      displayingMarker.setOptions({
        zIndex: 1,
        icon: {
          url: './img/marker_default.png',
          scaledSize: new google.maps.Size(20,20),
        }
      });
    }
    displayingWindow = null;
    displayingMarker = null;
  }

  // 企業リストが表示されているか
  const isOpened = () => {
    if ($('.list_anchor').hasClass('opened')) {
      return true;
    }
    return false;
  }
}

function getSmallNum(num1, num2) {
  return (num1 < num2) ? num1 : num2;
};
function getLargeNum(num1, num2) {
  return (num1 > num2) ? num1 : num2;
};
