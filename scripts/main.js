$(document).ready(function(){
    $('#default').on('click', function(){
        $('#data').val('Lucía,7,6.5,9.2,8.6,8\nPedro,7.5,9.4,7.3,7,7\nInés,7.6,9.2,8,8,7.5\nLuis,5,6.5,6.5,7,9\nAndrés,6,6,7.8,8.9,7.3\nAna,7.8,9.6,7.7,8,6.5\nCarlos,6.3,6.4,8.2,9,7.2\nJosé,7.9,9.7,7.5,8,6\nSonía,6,6,6.5,5.5,8.7\nMaría,6.8,7.2,8.7,9,7');
        $('#data').trigger('autoresize');
        $('#data').focus();
    });
    $('#generar').on('click', generaAlgortimo);
});

/* Funcion que ejecuta el algoritmo de analisis jerarquico*/
function generaAlgortimo() {
    var data = parseData ($('#data').val());
    generaTabla($('#data').val());
    var centroides = false;
    var distancias = false;
    root = jerarquico.aglomerar(data['labels'], data['vectors']);
    var pre = document.getElementById('text');
    var text = root.construyeDendograma(centroides,distancias);
    $('#jerarquia-result').html(text);
}

function generaTabla(datos){
    console.log(datos);
    var data = datos;
    var lines = data.split("\n"),
        output = [],
        i;
    for (i = 0; i < lines.length; i++)
        output.push("<tr><td>"
        + lines[i].split(",").join("</td><td>")
        + "</td></tr>");
    output = "<h5>Tabla de resultados</h5><table class='bordered striped'>" + output.join("") + "</table>";
    $('#tabla-datos').html(output);
}
/*Genera la lectura de los datos, agregandolas en un objeto para su calculo*/
function parseData(data) {
    var labels = new Array();
    var vectors = new Array();
    lines = data.split("\n");
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].length == 0)
            continue;
        var elements = lines[i].split(",");
        var label = elements.shift();
        var vector = new Array();
        for (j = 0; j < elements.length; j++)
            vector.push(parseFloat(elements[j]));
        vectors.push(vector);
        labels.push(label);
    }
    return {'labels': labels , 'vectors': vectors};
}

/* Objeto que contiene todos los metodos para generar el analisis jerarquicp*/
var jerarquico = function () {
    /* Calcula la distancia euclidiana entre dos puntos dados*/
    function distanciaEuclidiana (vec1 , vec2) {
        var N = vec1.length;
        var d = 0;
        for (var i = 0; i < N; i++)
            d += Math.pow (vec1[i] - vec2[i], 2)
        d = Math.sqrt (d);
        return d;
    }

    /* Repite el numero de caracteres para generar la jerarquia del dendograma */
    function repetirChar(c, n) {
        var str = "";
        for (var i = 0; i < n; i++)
            str += c;
        return str;
    }

    /* Calcula los centroides en base a los puntos dados por el tamaño de los clusters. */
    function calculaCentroide (c1Size , c1Centroid , c2Size , c2Centroid) {
        var nuevoCentroide = new Array(c1Centroid.length);
        var newSize = c1Size + c2Size;
        for (var i = 0; i < c1Centroid.length; i++)
            nuevoCentroide[i] = (c1Size * c1Centroid[i] + c2Size * c2Centroid[i]) / newSize;
        return nuevoCentroide;
    }

    /* Centra las etiquetas de los datos para visualizar en el dendograma*/
    function centrarCadena(str, width) {
        var diff = width - str.length;
        if (diff < 0)
            return;
        var halfdiff = Math.floor(diff / 2);
        return repetirChar (" " , halfdiff) + str + repetirChar (" " , diff - halfdiff) ;
    }

    /* Funcion de visualizacion de las ramas del dendograma */
    function agregaCadena(str, width, index) {
        var diff = width - str.length;
        if (diff < 0)
            return;
        return repetirChar (" " , index) + str + repetirChar (" " , width - (str.length+index));
    }

    /* Genera una cadena con el vector dado */
    function prettyVector(vector) {
        var vals = new Array(vector.length);
        var precision = Math.pow(10, 2);
        for (var i = 0; i < vector.length; i++)
            vals[i] = Math.round(vector[i]*precision)/precision;
        return vals.join(",")
    }

    function prettyValue(value) {
        var precision = Math.pow(10, 2);
        return String (Math.round(value*precision)/precision);
    }

    /* Genera el dendograma en base al arbol dado, los centroides y la distancia de los clusters */
    function generaDendograma(tree, centroides, distancias) {
        var lines = new Array;
        var centroidstr = prettyVector(tree.centroid);
        if (tree.esRama()) {
            var labelstr = String(tree.label);
            var len = 1;
            if (centroides){len = Math.max(centroidstr.length , len);}
            len = Math.max(labelstr.length , len);
            lines.push (centrarCadena ("|" , len));
            if (centroides){lines.push (centrarCadena (centroidstr , len));}
            lines.push (centrarCadena (labelstr , len));

        } else {
            var distancestr = prettyValue(tree.dist);
            var left_dendo = generaDendograma(tree.left ,centroides, distancias);
            var right_dendo = generaDendograma(tree.right,centroides,distancias);
            var left_bar_ix = left_dendo[0].indexOf("|");
            var right_bar_ix = right_dendo[0].indexOf("|");
            // calcula el numero de caracteres en cada linea
            var len = 3 + right_dendo[0].length + left_dendo[0].length;
            if (centroides)
                len = Math.max(centroidstr.length , len);
            if (distancias)
                len = Math.max(distancestr.length , len);
            // calcula la posicion de una nueva linea vertical
            var bar_ix =  left_bar_ix + Math.floor(( left_dendo[0].length - (left_bar_ix) + 3 + (1+right_bar_ix)) / 2);

            // agrega una nueva linea vertical
            lines.push (agregaCadena ("|" , len , bar_ix));
            if (centroides) {
                lines.push (agregaCadena (centroidstr , len , bar_ix - Math.floor (centroidstr.length / 2))); //centrarCadena (centroidstr , len));
            }
            if (distancias) {
                lines.push (agregaCadena (distancestr , len , bar_ix - Math.floor (distancestr.length / 2))); //centrarCadena (centroidstr , len));
            }

            // agrega una linea horizontal para conectar a las lineas verticales
            var hlineLen = 3 + (left_dendo[0].length -left_bar_ix) + right_bar_ix+1;
            var hline = repetirChar ("_" , hlineLen);
            lines.push (agregaCadena(hline, len, left_bar_ix));


            var masCorto;
            var masLargo;
            if (left_dendo.length > right_dendo.length) {
                masLargo = left_dendo;
                masCorto = right_dendo;
            } else {
                masLargo = right_dendo;
                masCorto = left_dendo;
            }
            // repite la primera linea con una linea vertical
            header = masCorto[0];
            var toadd = masLargo.length - masCorto.length;
            for (var i = 0; i < toadd; i++) {
                masCorto.splice (0,0,header);
            }
            //une las 2 ramas
            for (var i = 0; i < Math.max (left_dendo.length , right_dendo.length); i++) {
                var left = "";
                if (i < left_dendo.length)
                    left = left_dendo[i];
                else
                    left = repetirChar (" " , left_dendo[0].length);

                var right = "";
                if (i < right_dendo.length)
                    right = right_dendo[i];
                else
                    right = repetirChar (" " , right_dendo[0].length);
                lines.push(left + repetirChar (" " , 3) + right);
                var l = left + repetirChar (" " , 3) + right;
            }
        }
        return lines;
    }



    function aglomerar (labels, vectors) {
        var N = vectors.length;
        var dMin = new Array(N);
        var cSize = new Array(N);
        var matrixObj = new jerarquico.Matrix(N,N);
        var distMatrix = matrixObj.mtx;
        var clusters = new Array(N);

        var c1, c2, c1Cluster, c2Cluster, i, j, p, root , nuevoCentroide;

        var distance = distanciaEuclidiana;


        // Inicializa el array de la matriz y los clusters.
        for (i = 0; i < N; i++) {
            dMin[i] = 0;
            for (j = 0; j < N; j++) {
                if (i == j)
                    distMatrix[i][j] = Infinity;
                else
                    distMatrix[i][j] = distance(vectors[i] , vectors[j]);

                if (distMatrix[i][dMin[i]] > distMatrix[i][j] )
                    dMin[i] = j;
            }
        }

        // Crea las ramas del arbol.
        for (i = 0; i < N; i++) {
            clusters[i] = [];
            clusters[i][0] = new Node (labels[i], null, null, 0, vectors[i]);
            cSize[i] = 1;
        }

        // Ciclo principal
        for (p = 0; p < N-1; p++) {
            // encuentre el primer par de clusters
            c1 = 0;
            for (i = 0; i < N; i++) {
                if (distMatrix[i][dMin[i]] < distMatrix[c1][dMin[c1]])
                    c1 = i;
            }
            c2 = dMin[c1];

            // crea un nodo para almacenar la informacion de los nodos.
            c1Cluster = clusters[c1][0];
            c2Cluster = clusters[c2][0];

            nuevoCentroide = calculaCentroide ( c1Cluster.size , c1Cluster.centroid , c2Cluster.size , c2Cluster.centroid );
            nuevoCluster = new Node (-1, c1Cluster, c2Cluster , distMatrix[c1][c2] , nuevoCentroide);
            clusters[c1].splice(0,0, nuevoCluster);
            cSize[c1] += cSize[c2];

            for (j = 0; j < N; j++) {
               if (distMatrix[c1][j] > distMatrix[c2][j])
                    distMatrix[j][c1] = distMatrix[c1][j] = distMatrix[c2][j];
            }
            distMatrix[c1][c1] = Infinity;

            for (i = 0; i < N; i++)
                distMatrix[i][c2] = distMatrix[c2][i] = Infinity;

            for (j = 0; j < N; j++) {
                if (dMin[j] == c2)
                    dMin[j] = c1;
                if (distMatrix[c1][j] < distMatrix[c1][dMin[c1]])
                    dMin[c1] = j;
            }

            root = nuevoCluster;
        }
        return root;
    }

    function Matrix (rows,cols){
        this.rows = rows;
        this.cols = cols;
        this.mtx = new Array(rows);
        for (var i = 0; i < rows; i++){
            var row = new Array(cols);
            for (var j = 0; j < cols; j++)
                row[j] = 0;
            this.mtx[i] = row;
            }
    }

    function Node (label,left,right,dist, centroid){
        this.label = label;
        this.left = left;
        this.right = right;
        this.dist = dist;
        this.centroid = centroid;
        if (left == null && right == null) {
            this.size = 1;
            this.depth = 0;
        } else {
            this.size = left.size + right.size;
            this.depth = 1 + Math.max (left.depth , right.depth );
        }
    }
    return {
        SINGLE_LINKAGE: 0,
        EUCLIDIAN_DISTANCE: 0,
        Matrix: Matrix,
        Node: Node,
        generaDendograma: generaDendograma,
        aglomerar: aglomerar
    }
}();

jerarquico.Node.prototype.esRama = function(){
    if ((this.left == null) && (this.right == null))
        return true;
    else
        return false;
}

jerarquico.Node.prototype.construyeDendograma = function (centroides, distancias){
    lines = jerarquico.generaDendograma(this,centroides, distancias);
    return lines.join ("\n");
}