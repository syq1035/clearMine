
$(function(){
    
    //去掉默认的contextmenu事件，否则会和默认右键事件同时出现。
    document.oncontextmenu = function (e) {
        e.preventDefault();
    };

    //单个网格宽高
    let GAID_WIDTH = 30;
    let GAID_HEIGHT = 30;

    let row = 0, col = 0, mine = 0;

    //存储格子身份状态，状态1为雷
    let gridStatus_arr = [];
    //存储格子周围八个格子雷的数量
    let mineNum_arr = [];
    //存储格子点击状态，点击过的为1
    let click_arr = [];
    let sign = false;

    //jQuery取canvas
    context = $("#canvas")[0].getContext("2d");
    
    $(".type").click(function(){
        row = $(this).data('row');
        col = $(this).data('col');
        mine = $(this).data('mine');
        init(mine);
    })

    //初始化
    function init(mine){
        createGrid();
        createMine(mine);
        countArountMine();
        createClickEvent();
    }

    //创建网格，利用canvas画线实现
    function createGrid(){
        //计算画布宽高
        let width = GAID_WIDTH*col;
        let height = GAID_HEIGHT*row;

        //设置画布宽高
        canvas.setAttribute("width",width)
        canvas.setAttribute("height",height)
        //描绘边框
        context.beginPath();
        context.linewidth = 1; 
        context.rect(0,0,width,height);
        context.stroke();
        context.fillStyle = '#909090';
        context.fill();

        //准备画横线
        for(let row_i = 1; row_i<row; row_i++){
            var y = row_i*GAID_HEIGHT; 
            context.strokeStyle = 'white';            
            context.moveTo(0,y);  
            context.lineTo(width,y);
        }
        //准备画竖线
        for(let col_i = 1; col_i<col; col_i++){
            var x = col_i*GAID_WIDTH;  
            context.strokeStyle = 'white';                        
            context.moveTo(x,0);  
            context.lineTo(x,height);
        }
        //完成描绘  
        context.stroke();
    }

    //随机生成雷，改变雷格子的身份状态
    function createMine(mine){
        $('#mine').text(mine);
        //将数组变为二维
        for(let i=0; i<row; i++){
            gridStatus_arr[i] = [];
            mineNum_arr[i] = [];
            click_arr[i] = [];
        }
        //初始化二维数组
        for(let i=0; i<row; i++){
            for(let j=0; j<col; j++){
                gridStatus_arr[i][j] = 0;
                mineNum_arr[i][j] = 0;
                click_arr[i][j] = 0;
            }
        }
        //添加雷，改变格子身份状态
        while(mine!=0){
            let mine_row = Math.floor(Math.random() * row);
            let mine_col = Math.floor(Math.random() * col);
            mine--;
            //预防生成位置相同
            if(gridStatus_arr[mine_row][mine_col] == 1){
                mine++;
                continue;
            }
            //雷的位置改变状态为1
            gridStatus_arr[mine_row][mine_col] = 1;
        }
        //console.log(gridStatus_arr);
    }

    //计算每个格子周围八个格子雷的数量存入数组
    function countArountMine(){
        for(let i=0; i<row; i++){
            for(let j=0; j<col; j++){
                let around = aroundGrid(i,j);
                let nx = around.nx,
                    sx = around.sx,
                    wy = around.wy,
                    ey = around.ey;
                
                let mineNum = 0; 

                for(let x=nx; x<=sx; x++){
                    for(let y=wy; y<ey; y++){
                        if(gridStatus_arr[x][y]==1){
                            mineNum++;
                        }
                    }
                }
                mineNum_arr[i][j] = mineNum;                            
            }
        }
        //console.log(mineNum_arr);
    }

    //添加点击事件
    function createClickEvent(){
        
        //先将canvas先前的事件清空
        $("#canvas").off();
        //添加鼠标点击事件
        $("#canvas").mousedown(function(e){
            //因为canvas的X，Y坐标和数组的行列相反，这里直接转换了一下
            let x = Math.floor(e.offsetY / GAID_HEIGHT);
            let y = Math.floor(e.offsetX / GAID_WIDTH);

            // e.which = 1为鼠标左键 ;  e.which = 3为鼠标右键
            if(e.which == 1){
                judgeGridStatus(x,y);
            }else if(e.which == 3){
                signMine(x,y);
            }
        })
        // $("#canvas").mousemove(function(e){

        // })
    }
    
    //判断是否点击到雷，看游戏是否结束
    function judgeGridStatus(x,y){
        if(gridStatus_arr[x][y] == 1){
            showMine(x,y);
            alert("游戏结束");
        }else{
            showNum(x,y);
            win();
        }
    }

    //扫雷成功，游戏结束
    function win(){
        let showNum = 0;
        for(let i=0; i<row; i++){
            for(let j=0; j<col; j++){
                if(click_arr[i][j]){
                    showNum++;
                }
            }
        }
        if(showNum == row*col - mine){
            alert("太棒了，扫雷成功！")
        }
    }

    //在格子上显示周围九宫格雷的数量
    function showNum(x,y){
        let num = mineNum_arr[x][y];
        click_arr[x][y] = 1;
        context.fillStyle = '#B0B0B0';
        context.fillRect(y*GAID_HEIGHT+1, x*GAID_WIDTH+1, GAID_HEIGHT-2,GAID_WIDTH-2);
        
        if(num == 0){
            let around = aroundGrid(x,y);
            let nx = around.nx,
                sx = around.sx,
                wy = around.wy,
                ey = around.ey;
            for(let i=nx; i<=sx; i++){
                for(let j=wy; j<=ey; j++){
                    if(click_arr[i][j]||gridStatus_arr[i][j]){
                        continue;
                    }else{
                        showNum(i,j);                                                                            
                    }
                }
            }
        }else{
            context.font="20px Georgia";
            context.fillStyle = "black";            
            context.fillText(num, y*GAID_WIDTH + 10, x*GAID_HEIGHT + 20);
        }
    }

    //点到雷后显示所有雷的位置
    function showMine(x,y){
        for(let i=0; i<row; i++){
            for(let j=0; j<col; j++){
                if(gridStatus_arr[i][j] == 1){
                    context.fillStyle = '#B0B0B0';
                    context.fillRect(j*GAID_HEIGHT+1, i*GAID_WIDTH+1, GAID_HEIGHT-2,GAID_WIDTH-2);                        
                    context.beginPath();
                    context.arc(15 + j * GAID_HEIGHT, 15 + i * GAID_WIDTH, 6, 0, 2 * Math.PI);//画圆
                    context.closePath();
                    context.fillStyle = "black";
                    context.fill();
                }
            }
        }
        //当前点击的雷样式不同
        context.fillStyle = '#B0B0B0';
        context.fillRect(y*GAID_HEIGHT+1, x*GAID_WIDTH+1, GAID_HEIGHT-2,GAID_WIDTH-2);            
        context.beginPath();
        context.arc(15 + y * GAID_HEIGHT, 15 + x * GAID_WIDTH, 6, 0, 2 * Math.PI);//画圆
        context.closePath();
        context.fillStyle = "red";
        context.fill();
    }

    //右键点击标记雷
    function signMine(x,y){
        if(!sign){
            sign = true;
            context.font="15px Georgia";
            context.fillStyle = "red";
            context.fillText("M", y*GAID_WIDTH + 8, x*GAID_HEIGHT + 20);    
        }else{
            sign = false;            
            context.font="15px Georgia";
            context.fillStyle = "#999";
            context.fillText("M", y*GAID_WIDTH + 8, x*GAID_HEIGHT + 20);    
        }
    }

    //返回网格周围九宫格的范围
    function aroundGrid(x,y){
        let around = {
            nx: 0,
            sx: 0,
            wy: 0,
            ey: 0
        }
        if(x-1<0){
            around.nx = 0;
            around.sx = 1;
        }else if(x+1 >= row){
            around.nx = row-2;
            around.sx = row-1;
        }else{
            around.nx = x-1;
            around.sx = x+1;
        }

        if (y - 1 < 0) {
            around.wy = 0;
            around.ey = 1;
        } else if (y + 1 >= col) {
            around.wy = col - 2;
            around.ey = col - 1;
        } else {
            around.wy = y - 1;
            around.ey = y + 1;
        }
        return around;
    }

})