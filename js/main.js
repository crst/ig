var T = {};


// ------------------------------------------------------------------------------------------------
// Initialization

$(document).ready(function () {
  T.n = T.data.length;
  T.autoplay = false;

  T.items = [];
  T.thumbs = [];
  for (var i = 0; i < T.data.length; i++) {
    T.items.push(T.renderItem(T.data[i][0], T.data[i][1], T.data[i][2]).hide());
    T.thumbs.push(T.renderThumbnail(i, T.data[i][1], T.path + T.data[i][0]));
  }

  $('#main-container').prepend(T.items);
  $('#thumbnail-list').append(T.thumbs);

  T.pos = Math.floor(Math.random() * T.n);
  T.jumpTo(T.pos);
  
  $('.prev').click(T.moveRight);
  $('.play').click(T.toggleAutoplay);
  $('.next').click(T.moveLeft);
  $(document).bind('keydown', function (e) {
    if (e.keyCode === 37) { T.moveRight(); }
    else if (e.keyCode === 32) { T.toggleAutoplay(); }
    else if (e.keyCode === 39) { T.moveLeft(); }
  });

  T.bindThumbnailEvents();
});


T.bindThumbnailEvents = function () {
  $('.thumbnail')
    .click(function () {
      T.jumpTo(parseInt($(this).attr('data-number'), 10));
    })
    .hover(
      function () {
        var pos = $(this).position();
        var iw = $(this).width(), ih = $(this).height();
        var off = $('#thumbnail-list').offset();

        var disp = $('#thumbnail-desc');
        disp.html($(this).attr('data-title'));
        var w = disp.width(), h = disp.height();
        disp.css({'left': pos.left + off.left - (w / 4) + (iw / 4),
                  'top' : pos.top + off.top + ih + (h / 2) + 2}).show();
      },
      function () { $('#thumbnail-desc').hide(); }
    );
};


// ------------------------------------------------------------------------------------------------
// Autoplay

T.toggleAutoplay = function () {
  T.autoplay = !T.autoplay;

  if (T.autoplay) {
    $('.play').html('&#x25A1;');
    T.moveLeft();
    T.setMoveTimer(T.moveLeft);
  } else {
    $('.play').html('-&rsaquo;');
  }
};


T.setMoveTimer = function (modifier) {
  window.clearTimeout(T.timer);
  T.timer = window.setTimeout(
    function () {
      if (T.autoplay) {
        modifier();
        T.setMoveTimer(modifier);
      }
    },
    T.delay * 1000
  );
};


// ------------------------------------------------------------------------------------------------
// Item movements

T.jumpTo = function (nr) {
  T.items[mod(T.pos - 1, T.n)].hide().removeClass('move item-left');
  T.items[mod(T.pos, T.n)].hide().removeClass('move item-middle');
  T.items[mod(T.pos + 1, T.n)].hide().removeClass('move item-right');

  T.changePos(function (n) { return mod(nr, T.n); });

  T.items[mod(T.pos - 1, T.n)].addClass('item-left').show();
  T.items[mod(T.pos, T.n)].addClass('item-middle').show();
  T.items[mod(T.pos + 1, T.n)].addClass('item-right').show();
};


// We do not allow changing the direction as long as the animation is still running.
T.setUnblockMovementTimer = function () {
  window.clearTimeout(T.blockTimer);
  T.blockTimer = window.setTimeout(
    function () {
      T.leftBlocked = false;
      T.rightBlocked = false;
    },
    1000
  );
};

T.moveLeft = function () {
  if (T.leftBlocked) { return; }
  T.rightBlocked = true;

  T.items[mod(T.pos + 1, T.n)].addClass('move item-middle').removeClass('item-right');
  T.items[mod(T.pos, T.n)].addClass('move item-left').removeClass('item-middle');
  T.items[mod(T.pos + 2, T.n)].addClass('item-right').fadeIn(1000);
  T.items[mod(T.pos - 1, T.n)].removeClass('move').fadeOut(1000, function () {
    $(this).removeClass('item-left');
  });

  T.changePos(function (n) { return mod(n + 1, T.n); });
  T.setUnblockMovementTimer();
};

T.moveRight = function () {
  if (T.rightBlocked) { return; }
  T.leftBlocked = true;

  T.items[mod(T.pos - 1, T.n)].addClass('move item-middle').removeClass('item-left');
  T.items[mod(T.pos, T.n)].addClass('move item-right').removeClass('item-middle');
  T.items[mod(T.pos - 2, T.n)].addClass('item-left').fadeIn(1000);
  T.items[mod(T.pos + 1, T.n)].removeClass('move').fadeOut(1000, function () {
    $(this).removeClass('item-right');
  });

  T.changePos(function (n) { return mod(n - 1, T.n); });
  T.setUnblockMovementTimer();
};


T.changePos = function (f) {
  $('#thumbnail-list img').css('opacity', 0.33);
  T.pos = f(T.pos);
  $('#thumb-' + T.pos).find('img').css('opacity', 1);
};


// ------------------------------------------------------------------------------------------------
// UI "templates"

T.renderItem = function (img, title, subtitle) {
  var html = ['<div class="item">',
              '<img src="', T.path, img, '">',
              '<div class="reflection");">',
              '<img src="', T.path, img, '">',
              '<div class="reflection-layer">',
              '<div class="desc">',
              '<p class="desc-title">', title, '</p>',
              '<p class="desc-subtitle">', subtitle, '</p>',
              '</div>',
              '</div></div></div>'];
  return $(html.join(''));
};

T.renderThumbnail = function (nr, title, img) {
  var html = ['<div id="thumb-', nr, '" class="thumbnail" ',
              'data-number="', nr, '" data-title="', title, '">',
              '<img src="', img, '">',
              '</div>'];
  return $(html.join(''));
};


// ------------------------------------------------------------------------------------------------

var mod = function (x, n) {
  return ((x % n) + n) % n;
};
