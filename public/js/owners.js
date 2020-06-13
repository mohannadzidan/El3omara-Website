{/* <tr>
<td>Donna Snider</td>
<td>Customer Support</td>
<td>New York</td>
<td>27</td>
<td>2011/01/25</td>
<td>$112,000</td>
</tr> */}
var owners = [];
function showAddOwnerForm(){

}
function tabulatedOwners() {
    var db = firebase.database();

    var y = document.createElement("TR");
    var table = document.getElementById("ownersTable");
    table.appendChild(y);
    var a = document.createElement("TD");
    var b = document.createElement("TD");
    var c = document.createElement("TD");
    var name = document.createTextNode("Sobhy Abd-Elmonem");
    var flatNumber = document.createTextNode("101");
    var phoneNumber = document.createTextNode("01018176872");
    a.appendChild(name);
    b.appendChild(flatNumber);
    c.appendChild(phoneNumber);
    y.appendChild(a);
    y.appendChild(b);
    y.appendChild(c);
    
}
