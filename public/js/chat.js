/**
 * Created by zz on 2016/8/30.
 */
!$(function () {
  var content = $('#content');
  var status = $("#status");
  var input = $("#enterInput");
  var myName = false;

  function socketInit() {
    //建立websocket连接
    socket = io.connect('http://127.0.0.1:3000');
    //收到seerver的连接确认
    socket.on('open', function () {
      /*$.get("/userimg/",function(data){
       console.log(data)
       });*/
      $(".choose-box").on("dblclick", "a.thumbnail", function () {
        var thisImg = $(this).children("img"),
          name = thisImg.attr("alt");
        myName=name;
        socket.send(name);
        $(".choose-box").fadeOut("fast");
        $(".join-box").append('<li class="user-detail"><h4>' + thisImg.data("index") + ':' + name + '</h4><img src="' + thisImg.attr("src") + '" alt="' + name + '" style="display:block;"> <p>0</p> </li>')
        return false;
      });
    })

    //监听system事件，判断不能welcome或者disconnect，打印系统消息信息
    socket.on('system', function (json) {
      var p = '';
      if (json.type === 'welcome') {
        if (myName == json.text) {
          status.html(myName + ':').css('color', json.color);
        }
        p = '<p style="background:' + json.color + ';">system @ ' + json.time + ':Welcome' + json.text + '</p>';
      } else if (json.type == 'disconnect') {
        console.log(json);
        p = '<p style="background:' + json.color + ';">system @' + json.time + ':Bye' + json.text + '</p>';
      }
      content.prepend(p)
    });

    //监听message事件，打印消息信息
    socket.on('message', function (json) {
      if (json.draw) {
        if (json.author === myName) {
          return false
        } else {
          ctx.strokeStyle = json.draw.panColor;
          ctx.strokeWidth = json.draw.panRaduis;
          ctx.beginPath();
          for (var i = 0; i < json.draw.points.length; i++) {
            i === 0 ? ctx.moveTo(json.draw.points[i].x, json.draw.points[i].y) : ctx.lineTo(json.draw.points[i].x, json.draw.points[i].y);
          }
          ctx.stroke();
        }
      } else {
        var p = '<p><span style="color: ' + json.color + ';">' + json.author + '</span> @' + json.time + ':' + json.text + '</p>';
        content.prepend(p);
      }
    });

    //通过回车提交聊天信息
    input.keydown(function (e) {
      if (e.keyCode === 13) {
        var msg = $(this).val();
        if (!msg) {
          return false
        }
        socket.send(msg);
        $(this).val('');
        if (myName === false) {
          myName = msg;
        }
      }
    });
  }

  socketInit();

  /*绘制canvas*/
  var points = [];
  var drawType="pan";
  var panColor = "#000";
  var panRaduis = 2;
  var c = document.getElementById("myCanvas");
  var ctx = c.getContext("2d");
  var drawInit = false;
  $(".pan-color-block li").on("click", function () {
    $(this).addClass("current").siblings(".current").removeClass("current");
    panColor=$(this).data("color");
  });
  $(".pan-width-block li").on("click", function () {
    $(this).addClass("current").siblings(".current").removeClass("current");
    panRaduis=$(this).data("width");
  });
  $(".pan-type-block li").on("click", function () {
    $(this).addClass("current").siblings(".current").removeClass("current");
    drawType=$(this).data("type");
  });
  $("#myCanvas").on("mousedown", function (e) {
    ctx.strokeStyle = panColor;
    ctx.lineWidth = panRaduis;
    ctx.beginPath()
    ctx.moveTo(e.offsetX, e.offsetY);
    points = [];
    recordPoint(e);//当前记录一次
    drawInit = true;
    $(this).on("mousemove", recordPoint);
  }).on("mouseup", stopDraw).on("mouseleave", stopDraw);

  function stopDraw() {
    if (!drawInit) {
      return
    }
    drawInit = false;
    $("#myCanvas").off("mousemove", recordPoint);
    points.length && socket.send({
      points: points,
      panColor: panColor,
      panRaduis: panRaduis
    });//发送坐标点
  }

  function recordPoint(e) {//跟随鼠标移动
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    points.push({x: e.offsetX, y: e.offsetY});
  }
});























