var map = new BMap.Map("map");                        // 创建Map实例
map.centerAndZoom("重庆", 11);     // 初始化地图,设置中心点坐标和地图级别
var defaultCursor = map.getDefaultCursor();
map.enableScrollWheelZoom(true);   //鼠标滑动轮子可以滚动    
map.addControl(new BMap.NavigationControl());  //添加鱼骨控件
map.addControl(new BMap.MapTypeControl());     //添加地图类型控件
map.addControl(new BMap.ScaleControl());     
map.addControl(new BMap.OverviewMapControl());

var key = 1;    //开关
var count = 0;
var points = [];    //数组，放经纬度信息
var layouts = [];   //存放图层数组
var myOrder = [];

var pW = $(window).width()*0.29;
$('#myCanvas').attr({"width":pW,"height":pW});

function startTool() {   //开关函数
    if (key == 1) {
        map.setDefaultCursor("crosshair"); //设置十字光标
        document.getElementById("startBtn").style.background = "green";
        document.getElementById("startBtn").style.color = "white";
        document.getElementById("startBtn").value = "结束选点";
        key = 0;
    }
    else {
        showForm();
    }
}

function showForm(){
    $("#button").hide();
    $("#dialog").fadeIn();
}

function showButton(){
    $("#dialog").hide();
    $("#button").fadeIn();
}

function passOrder(od){
    var i = 0;
    var first = -1;
    var second = -1;
    var type = 0;
    for(i;i<od.length-1;i++){
        if(od[i] !== i){
            first = i;
            if(od[i] - i == 1){
                type = 0;
            } else {
                type = 1;
            }
            break;
        }
    }
    for(i = od.length - 1;i>0;i--){
        if(od[i] !== i){
            second = i;
            break;
        }
    }
    if(!type){
        var tem = layouts.splice(first,1);
        layouts.splice(second,0,tem[0]);
    } else {
        var tem = layouts.splice(second,1);
        layouts.splice(first,0,tem[0]);
    }
    for(i=0;i<layouts.length;i++){
        layouts[i][layouts[i].length-1].layer = i;
    }
    createLayer();
    drawPainter();
    $(".output").html(JSON.stringify(layouts));
}

function saveAttr(){
     if(($("#cate").val() == "") || ($("#name").val() == "")){
        alert("请输入");
        return;
    }
    map.setDefaultCursor(defaultCursor); //设置默认光标
    document.getElementById("startBtn").style.background = "red";
    document.getElementById("startBtn").value = "开启选点";
    if($("#closure").val() == '1'){
        drawOverlay(true, true);
    } else{
        drawOverlay(true, false);
    };
    var attr = {cate:$("#cate").val(), name:$("#name").val(),color:$("#color").val(),closure:$("#closure").val(), layer:count};
    points.push(attr);
    layouts.push(points);
    $(".output").html(JSON.stringify(layouts));
    createLayer();
    points = [];
    count ++;
    key = 1;
    showButton();
    drawPainter()
}


function createLayer(){
    if(layouts.length == 0) return;
    var content = "";
    var i = 0;
    $(".sortable").html("");
    for(i = 0;i < layouts.length; i++){
        content += "<li class=\"ui-state-default\" id=\""+layouts[i][layouts[i].length - 1].layer+"\">"+layouts[i][layouts[i].length - 1].name+"</li>";
    }
    $(".sortable").html(content);
}

function cancelAll(){
    layouts = [];
    count = 1;
    drawOverlay(false, false);
    $(".output").html("");
    $(".sortable").html("");
}

function drawPainter(){
    var res = procLayouts();
    console.log(res);
    console.log(pW);
    var myPx = pW/res.longer;
    
    var c=document.getElementById("myCanvas");
    var ctx=c.getContext("2d");
    ctx.clearRect(0,0,pW,pW);

    for(i = 0;i<layouts.length; i++){
        ctx.beginPath();
        ctx.lineWidth="2";
        ctx.strokeStyle=layouts[i][layouts[i].length-1].color; 
        ctx.moveTo((layouts[i][0].lng-res.x)*myPx,(res.y-layouts[i][0].lat)*myPx);
        for(var j = 1; j<layouts[i].length - 1; j++){
            ctx.lineTo((layouts[i][j].lng-res.x)*myPx,(res.y-layouts[i][j].lat)*myPx);
        }
        ctx.stroke();
        if(layouts[i][layouts[i].length-1].closure == '1'){
            ctx.fillStyle=layouts[i][layouts[i].length-1].color;
            ctx.fill();
        }
    }
}

function procLayouts(){
    var arrX = [];
    var arrY = [];
    var res = {x:0,y:0,longer:0};
    var maxX = 0;
    var minX = 0;
    var maxY = 0;
    var minY = 0;
    for(i = 0;i<layouts.length; i++){
        for(var j = 0; j<layouts[i].length - 1; j++){
            arrX.push(layouts[i][j].lng);
            arrY.push(layouts[i][j].lat);
        }
    }
    arrX.sort();
    arrY.sort();
    maxX = arrX[arrX.length-1];
    minX = arrX[0];
    maxY = arrY[arrY.length-1];
    minY = arrY[0];
    res.x = minX;
    res.y = maxY;
    res.longer = maxX - minX > maxY - minY?maxX - minX:maxY - minY;
    return res;
}

function drawOverlay(polyline, polygon) {  // 画折线和多边形
    map.clearOverlays();
    if (points.length == 0) return;
    //画点
    map.addOverlay(new BMap.Marker(points[points.length - 1]));
    //画折线
    if (polyline == true) {
        var polyline = new BMap.Polyline(); //折线覆盖物
        polyline.setPath(points);           //设置折线的点数组
        map.addOverlay(polyline);           //将折线添加到地图上
    }
    //画多边形
    if (polygon == true) {
        var polygon = new BMap.Polygon(points);
        map.addOverlay(polygon);            //将多边形添加到地图上
    }
}

map.addEventListener("click", function (e) {   //单击地图，形成折线覆盖物
    var lngLat = e.point;
    if (key == 0) {
        points.push(lngLat);  //将新增的点放到数组中
        drawOverlay(true, false);

        // 显示提示信息
        var zoomStr = "放大级别：" + this.getZoom();

        var lngLatStr = "<br />经纬度：" + lngLat.lng + ", " + lngLat.lat;

        var projection = this.getMapType().getProjection();
        var worldCoordinate = projection.lngLatToPoint(lngLat);
        var worldCoordStr = "<br />平面坐标：" + worldCoordinate.x + ", " + worldCoordinate.y;

        var pixelCoordinate = new BMap.Pixel(Math.floor(worldCoordinate.x * Math.pow(2, this.getZoom() - 18)),
                                             Math.floor(worldCoordinate.y * Math.pow(2, this.getZoom() - 18)));
        var pixelCoordStr = "<br />像素坐标：" + pixelCoordinate.x + ", " + pixelCoordinate.y;

        var tileCoordinate = new BMap.Pixel(Math.floor(pixelCoordinate.x / 256),
                                       Math.floor(pixelCoordinate.y / 256));
        var tileCoordStr = "<br />图块坐标：" + tileCoordinate.x + ", " + tileCoordinate.y;

        var viewportCoordinate = map.pointToPixel(lngLat);
        var viewportCoordStr = "<br />可视区域坐标：" + viewportCoordinate.x + ", " + viewportCoordinate.y;

        var overlayCoordinate = map.pointToOverlayPixel(lngLat);
        var overlayCoordStr = "<br />覆盖物坐标：" + overlayCoordinate.x + ", " + overlayCoordinate.y;

        var info = new BMap.InfoWindow('', { width: 260 });
        info.setContent(zoomStr + lngLatStr + worldCoordStr + pixelCoordStr + tileCoordStr +
                        viewportCoordStr + overlayCoordStr);
        // map.openInfoWindow(info, lngLat);
    }
});
