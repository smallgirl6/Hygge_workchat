// 打字功能(介紹的部分)
export function typeWriterAndClose() {
    var i = 0;
    var text = document.querySelector('.introducetext').innerHTML;
    document.querySelector('.introducetext').innerHTML = '';

    function typeWriter() {
        if (i < text.length) {
        document.querySelector('.introducetext').innerHTML += text.charAt(i);
        i++;
        if (text.charAt(i) === "&") {
            document.querySelector('.introducetext').innerHTML += "<br>";
            i += 8;
        }
        setTimeout(typeWriter, 50);
        }
    }
    typeWriter();
// 把打字功能的眶給關掉
    var introduceCloseIcon = document.querySelector('.introduce-close-icon');
    var introduceBox = document.querySelector('.introducebox');
    introduceCloseIcon.addEventListener("click", function() {
        introduceBox.style.display = "none";
    });
}

export function typeWriterAI(){
    var i = 0;
        var text = document.querySelector('.displayAItext').innerHTML;
        document.querySelector('.displayAItext').innerHTML = '';

    function typeWriterdisplayAI() {
        if (i < text.length) {
        document.querySelector('.displayAItext').innerHTML += text.charAt(i);
        i++;
        if (text.charAt(i) === "&") {
            document.querySelector('.displayAItext').innerHTML += "<br>";
            i += 8;
        }
        setTimeout(typeWriterdisplayAI, 50);
        }
    }
    typeWriterdisplayAI();
}