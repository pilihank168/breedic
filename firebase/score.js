function fillNode(nodeId, registerNo, source, score, sex, id){
    svg = document.getElementById(nodeId);
    svgt1 = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    svgt2 = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    svgt1.setAttribute("x", "50%")
    svgt1.setAttribute("dy", "-1em")
    svgt1.textContent = registerNo + "(" + (source||"") + ")";
    svgt2.setAttribute("x", "50%")
    svgt2.setAttribute("dy", "1em")
    svgt2.setAttribute("font-weight", "bold")
    svgt2.setAttribute("style", "fill:darksalmon;font-size:250%")
    svgt2.textContent = score;
    svg.appendChild(svgt1)
    svg.appendChild(svgt2)
    // make link
    if(sex)
        svg.closest("a").setAttribute("href", sex+".html?id="+id);
}
