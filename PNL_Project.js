//Phase 1: Input Parameters
var D = 2; //Dimension of the problem
var lb = [-5, -5]; //Lower bound of the variables
var ub = [5, 5]; //Upper bound of the variables
var N = 20; //Population size
var n = N;
var pa = 0.25; //Discovery rate of alien eggs/solutions
var max_iter = 100; //Maximum number of iteration

//Phase 2: Defining the Objective function
function fns(X, size = N){
    var result = new Array(size);
    for (var i = 0; i < size; i++){
        result[i] = X[i][0] * X[i][0];
        - X[i][0] * X[i][1] 
        + X[i][1] * X[i][1] 
        + 2 * X[i][0] 
        + 4 * X[i][1] 
        + 3;
    }
    return result;
}

//Phase 3: Generate Initial Population Randomly
var nest = new Array(N);
for (var i = 0; i < N; i++)
{
    nest[i] = new Array(D);
    for (var j = 0; j < D; j++)
    {
        nest[i][j] = lb[j] + Math.random() * (ub[j] - lb[j]);
    }
}

var fx = fns(nest);

var gamma = 1;
var beta = 3/2;
var sigma = Math.pow( ( gamma * (1 + beta) * Math.sin(Math.PI * beta / 2) ) / ( gamma * (1 + beta)/2 * beta * Math.pow(2, (beta - 1) / 2 ) ) , 1 / beta);

//Phase 4: Cuckoo Search Helper Functions
//Standard Normal variate using Box-Muller transform.
function randn_bm(m, n) {
    var arr = new Array(m);
    for (var i = 0; i < m; i++){
        arr[i] = new Array(n);
        for (var j = 0; j < n; j++){
            var u = 0, v = 0;
            while(u === 0) u = Math.random(); 
            while(v === 0) v = Math.random();
            //Converting [0,1) to (0,1)
            arr[i][j] = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
        }
    }
    return arr;
}
//size of 2D array
function size2d(arr){
    var dim = new Array(2);
    dim[0] = arr.length;
    if (typeof(arr[0]) == 'number') {
        dim[1] = 1;
    }
    else{
        dim[1] = arr[0].length;
    }
    return dim;
}

//Defining variables for Phase 6
var BestFx = new Array(max_iter);
var BestX = new Array(max_iter);
//Phase 4: Cuckoo Search MAIN LOOP START
for (var iter = 0; iter < max_iter; iter++){
    fnv = Math.min(...fx);
    indf = fx.indexOf(fnv);
    var best = fx[indf];
    for (var j; j < N; j++){
        var s = nest[j];
        var X = s;
        //Levy flights by Mantegna's Algorithm
        size_s = size2d(s);
        u = randn_bm(size_s[0], size_s[1]);
        u[0] *= sigma;
        u[1] *= sigma;
        
        v = randn_bm(size_s[0], size_s[1]);
        var step = new Array(2);
        var Xnew = new Array(2);
        for (var i = 0; i < 2; i++){
            step[i] = u[i] / Math.pow(Math.abs(v[i]), 1/beta);
            Xnew[i] = X[i] + randn_bm(size_s[0], size_s[1])[i] * 0.01 * step[i] * (X[i] - best);
        }

        //Check Bounds
        for (var kk = 0; kk = Xnew[1].length; kk++){
            if (Xnew[kk] > ub[kk]) Xnew[kk] = ub[kk];
            else if (Xnew[kk] = lb[kk]) Xnew[kk] = lb[kk];
        }

        //Perform Greedy Selection
        //var fnew = fns(Xnew, 1);//This procedure is dropped due to incosistent data structure along javascript unlike Matlab
        var fnew = 
            Xnew[0] * Xnew[0]
            - Xnew[0] * Xnew[1] 
            + Xnew[1] * Xnew[1] 
            + 2 * Xnew[0] 
            + 4 * Xnew[1] 
            + 3;
        if (fnew < fx[j]){
            nest[j] = Xnew;
            fx[j] = fnew;
        }
    }
    //Find the current best
    var fmin = Math.min(...fx);
    var K1 = fx.indexOf(fmin);
    best = nest[K1];

    //Phase 5: Replace some nest by contructing new solutions/nests
    //Replace some not-so-good nests by constructingcnew solutions/nests
    //A fraction of worse nests are discovered with a probability "pa"

    var K = new Array (N);
    for (var i = 0; i < N; i++){
        K[i] = new Array (2);
        if (Math.random() < pa) K[i][0] = 1;
        else K[i][0] = 0;
        if (Math.random() < pa) K[i][1] = 1;
        else K[i][1] = 0;
    }
    //Procedure to simulate randperm(n)
    ///////////////////////////////////
    var randperm_1 = new Array(n);
    var randperm_2 = new Array(n);
    for (var i = 0; i < N; i++){
        randperm_1[i] = i;
        randperm_2[i] = i;
    }

    function shuffle(array) {
        let currentIndex = array.length,  randomIndex;
        
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
        
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
        
            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
        return array;
    }
    randperm_1 = shuffle(randperm_1);
    randperm_2 = shuffle(randperm_2);
    //End of procedure to simulate randperm(n)
    //////////////////////////////////////////
    
    //Procedure to simulate nest(randperm(n), :)
    ////////////////////////////////////////////
    var stepsizeK = new Array(N);
    for (var i = 0; i < N; i++){
        stepsizeK[i] = new Array(D);
        for (var j = 0; j < D; j++){
            stepsizeK[i][j] = 
                Math.random() * 
                (nest[randperm_1[i]][j] 
                    - nest[randperm_2[i]][j]);
        }
    }
    //End of procedure to simulate nest(randperm(n), :)
    ///////////////////////////////////////////////////
    var new_nest = new Array(N);
    for (var i = 0; i < N; i++){
        new_nest[i] = new Array(D);
        for (var j = 0; j < D; j++){
            new_nest[i][j] 
                = nest[i][j] 
                + stepsizeK[i][j] 
                * K[i][j];
        }
    }

    //Check BOUNDS
    for (var ii = 0; ii < N; ii++){
        var s = new_nest[ii];
        for (var kk = 0; kk < D; kk++){
            if (s[kk] > ub[kk]) s[kk] = ub[kk];
            else if (s[kk] < lb[kk]) s[kk] = lb[kk];
        }
        new_nest[ii] = s;

        //Perform GREEDY SELECTION
        //Simulating fns functions for the 1D array s
        //////////////////////////////////////////////
        var fnew
            = s[0] * s[0];
            - s[0] * s[1] 
            + s[1] * s[1] 
            + 2 * s[0] 
            + 4 * s[1] 
            + 3;
        //End fo fns function Simulation
        ////////////////////////////////

        if (fnew < fx[ii]){
            nest[ii] = s;
            fx[ii] = fnew;
        }
    }

    //Phase 6: Memorize the BEST
    var optval = Math.min(...fx);
    var optind = fx.indexOf(optval);
    BestFx[iter] = optval;
    BestX[iter] = nest[optind];

    //Show Iteration Information
    console.log("Iteration #", iter, " Best Cost: ", BestFx[iter], "\n");
}
//Phase 7: Plotting the result
//Defining xArray for ploty.js
var iterArr = new Array(max_iter);
for (var i = 0; i < max_iter; i++){
    iterArr[i] = i + 1;
}
//Definig data for ploty.js
var graphData = [{
    x: iterArr,
    y: BestFx,
    mode:"lines",
    type:"scatter"
}];
//Defining layout for ploty.js
var layout = {
    xaxis: {range: [0, 100], title: "Iteration Number"},
    yaxis: {autorange: true, title: "Fitness Value"},
    title: "Convergence Vs. Iteration"
};
    
Plotly.newPlot("BEST", graphData, layout);

//Procedure to put the values in HTML table
function createTable(tableData) {
    var table = document.createElement('table');
    var tableBody = document.createElement('tbody');
  
    tableData.forEach(function(rowData) {
      var row = document.createElement('tr');
  
      rowData.forEach(function(cellData) {
        var cell = document.createElement('td');
        cell.appendChild(document.createTextNode(cellData));
        row.appendChild(cell);
      });
  
      tableBody.appendChild(row);
    });
  
    table.appendChild(tableBody);
    var header = table.createTHead();
    var row = header.insertRow(0);    
    var cell_1 = row.insertCell(0);
    var cell_2 = row.insertCell(1);
    cell_1.innerHTML = "<b>Iter#<b>";
    cell_2.innerHTML = "<b>BestFx<b>";
    document.body.appendChild(table);

}

var tableData_1 = new Array(max_iter / 4);
var tableData_2 = new Array(max_iter / 4);
var tableData_3 = new Array(max_iter / 4);
var tableData_4 = new Array(max_iter / 4);

for (var i = 0; i < max_iter / 4; i++){
    tableData_1[i] = new Array(2);
    tableData_1[i][0] = iterArr[i];
    tableData_1[i][1] = BestFx[i].toFixed(4);
}
for (var i = max_iter / 4; i < max_iter / 2; i++){
    tableData_2[i] = new Array(2);
    tableData_2[i][0] = iterArr[i];
    tableData_2[i][1] = BestFx[i].toFixed(4);
}
for (var i = max_iter / 2; i < 3* max_iter / 4; i++){
    tableData_3[i] = new Array(2);
    tableData_3[i][0] = iterArr[i];
    tableData_3[i][1] = BestFx[i].toFixed(4);
}
for (var i = 3 * max_iter / 4; i < max_iter; i++){
    tableData_4[i] = new Array(2);
    tableData_4[i][0] = iterArr[i];
    tableData_4[i][1] = BestFx[i].toFixed(4);
}

createTable(tableData_4);
createTable(tableData_3);
createTable(tableData_2);
createTable(tableData_1);