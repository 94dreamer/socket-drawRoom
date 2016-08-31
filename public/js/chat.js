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
    socket = io.connect('http://10.207.9.194:3000');
    //收到seerver的连接确认
    socket.on('open', function () {
      status.text('选择你的名字:')
    })

    //监听system事件，判断不能welcome或者disconnect，打印系统消息信息
    socket.on('system', function (json) {
      var p = '';
      if (json.type === 'welcome') {
        if (myName == json.text) {
          status.text(myName + ':').css('color', json.color);
        }
        p = '<p style="background:' + json.color + ';">system @ ' + json.time + ':Welcome' + json.text + '</p>';
      } else if (json.type == 'disconnect') {
        console.log(json);
        p = '<p style="background:' + json.color + ';">system @' + json.time + ':Bye' + json.text + '</p>';
      }
      content.prepend(p)
    });

    //监听message时间，打印消息信息
    socket.on('message', function (json) {
      var p = '<p><span style="color: ' + json.color + ';">' + json.author + '</span> @' + json.time + ':' + json.text + '</p>';
      content.prepend(p);
    })

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
    })
  }

  socketInit();

  /*绘制canvas*/
  var points = [];
  var panColor = "#000";
  var panRaduis = 2;
  var c = document.getElementById("myCanvas");
  var ctx = c.getContext("2d");

  $("#myCanvas").on("mousedown", function (e) {
    points = [];
    recordPoint(e);//当前记录一次
    $(this).on("mousemove", recordPoint);
  }).on("mouseup", stopDraw).on("mouseleave", stopDraw);

  function stopDraw() {
    $("#myCanvas").off("mousemove", recordPoint);
    ctx.strokeStyle = "red";
    ctx.fillStyle = panColor;
    //ctx.beginPath();
    //ctx.arc(event.offsetX,event.offsetY,panRaduis,0,2*Math.PI);
    //ctx.stroke();
    //ctx.fill();
    for (var i = 0; i < points.length; i++) {
      i === 0 ? ctx.moveTo(points[i].x, points[i].y) : ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    console.log();
  }

  //跟随鼠标移动
  function recordPoint(e) {
    points.push({x: e.offsetX, y: e.offsetY});
  }

});























