function getUser() { // 로딩 시 사용자가 가져오는 함수 
    var xhr = new XMLHttpRequest();     // AJAX 요청 
    xhr.onload = function () {
        if (xhr.status === 200) {
            var users = JSON.parse(xhr.responseText);   // JSON 객체 

            var list = document.getElementById('list');
            list.innerHTML = "";    // 이게 없으면 이전에 등록했던거도 다시 다 등록됨
                                    // 리스트 다 비우고 유저 하나씩만 붙히기 위함. 
            Object.keys(users).map(function (key) {
                var userDiv = document.createElement('div');
                var span = document.createElement('span');
                span.textContent = users[key];

                var edit = document.createElement('button');
                edit.textContent = "수정";
                edit.addEventListener('click', function () {    // 수정 버튼 클릭 
                    var name = prompt('바꿀 이름을 입력하세요.');
                    if(!name) {
                        return alert('이름을 반드시 입력하셔야 합니다.');
                    }
                    var xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        if (xhr.status === 200) {
                            console.log('(수정)xhr.responseText: ', xhr.responseText);
                            getUser();
                        } else {
                            console.error('(수정)Error - xhr.responseText: ', xhr.responseText)
                        }
                    };
                    xhr.open('PUT', '/users/' + key);
                    xhr.setRequestHeader('Content-Type','application/json');
                    xhr.send(JSON.stringify({ name: name}));
                });

                var remove = document.createElement('button');
                remove.textContent = '삭제';
                remove.addEventListener('click', function () {  // 삭제 버튼 클릭 
                    var xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        if (xhr.status === 200) {
                            console.log('(삭제)xhr.responseText: ', xhr.responseText);
                            getUser();
                        } else {
                            console.error('(삭제)Error - xhr.responseText: ', xhr.responseText)
                        }
                    };
                    xhr.open('DELETE', '/users/' + key);
                    xhr.send();
                });
                userDiv.appendChild(span);
                userDiv.appendChild(edit);
                userDiv.appendChild(remove);
                list.appendChild(userDiv);
            });
        } else {    // status === 200 이 아니면 
            console.error('NOT 200 Error - xhr.responseText: ', xhr.responseText);
        }
    };
    xhr.open('GET', '/users');
    xhr.send();
}

window.onload = getUser;    // 로딩 시 getUser 호출 
document.getElementById('form').addEventListener('submit', function (e) {   // 폼 제출 
    e.preventDefault();
    var name = e.target.username.value;     // form의 id가 username 이었음.
    if(!name) {
        return alert('이름을 입력하세요.');
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 201) {
            console.log('xhr.responseText: ', xhr.responseText);
            getUser();
        } else {
            console.error('Error - xhr.responseText: ', xhr.responseText)
        }
    };
    xhr.open('POST', '/users');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ name: name }));
    e.target.username.value = "";
});
