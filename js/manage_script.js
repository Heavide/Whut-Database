course_list=[]
schedule_list=[]

async function getClass() {
    try {
        const response = await fetch('http://localhost:5000/getclass');
        const courses = await response.json();
        return courses;
    } catch (error) {
        console.error('Error fetching courses:', error);
    }
}

async function navigateTo(menu) {
    const content = document.getElementById('content');
    
    if (menu === '课程库') {
        course_list = []

        content.innerHTML = '<h2>课程库 <button class="add-btn" onclick="openModal()">添加课程</button></h2>';
        
        const courseListContainer = document.createElement('div');
        courseListContainer.classList.add('course-list');

        courses = await getClass();
    
        // 创建课程列表
        courses.forEach(course => {
            const courseItem = document.createElement('div');
            courseItem.classList.add('course-item');
            
            const courseTitle = document.createElement('h3');
            courseTitle.textContent = course.CName;
            
            const courseDescription = document.createElement('p');
            courseDescription.textContent = course.CInfo;

            const editButton = document.createElement('button');
            editButton.textContent = "编辑";
            editButton.classList.add('course-edit-btn');
            editButton.onclick = () => openCourseEditModal(course.CNo);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = "删除";
            deleteButton.classList.add('delete-btn');
            deleteButton.onclick = () => deleteCourse(course.CNo);
            
            courseItem.appendChild(courseTitle);
            courseItem.appendChild(courseDescription);
            courseItem.appendChild(deleteButton);
            courseItem.appendChild(editButton);
            
            courseListContainer.appendChild(courseItem);

            course_list.push({CNo: course.CNo, CName: course.CName, CInfo: course.CInfo});
        });
        
        content.appendChild(courseListContainer);
    } else if (menu === '课程安排表') {
        renderScheduleTable();
    } else if (menu === '员工信息') {
        showEmployeeInfo();
    } else if (menu === '课表查询') {
        showScheduleQuery();
    } else if (menu === '代表信息') {
        showRepresentativeInfo();
    } else if (menu === '课程报名') {
        showCourseSignup();
    }
}

async function deleteCourse(courseId) {
    try {
        const response = await fetch(`http://localhost:5000/delclass/${courseId}`, { method: 'DELETE' });
        if (response.ok) {
            getClass(); // 删除成功后重新加载课程
            navigateTo('课程库');
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        alert('删除失败，该课程已有计划');
    }
}

async function addCourse(courseName, courseDescription) {
    
    try{
        await fetch('http://localhost:5000/addclass', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ CName: courseName, CInfo: courseDescription })
        });
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }

    navigateTo('课程库');
}

// 打开编辑模态框
function openCourseEditModal(courseId) {
    currentEditCourseId = courseId;
    const course = course_list.find(c => c.CNo === courseId);
    
    if (course) {
        const modal = document.getElementById('editCourseModal');
        document.getElementById('editCourseId').value = course.CNo;
        document.getElementById('editCourseName').value = course.CName;
        document.getElementById('editCourseDescription').value = course.CInfo;
        modal.style.display = "block";
    }
}

// 关闭编辑模态框
function closeCourseEditModal() {
    const modal = document.getElementById('editCourseModal');
    modal.style.display = "none";
}

// 保存编辑内容
async function saveEditCourse() {
    const courseId = document.getElementById('editCourseId').value;
    const courseName = document.getElementById('editCourseName').value;
    const courseDescription = document.getElementById('editCourseDescription').value;
    try{
        await fetch('http://localhost:5000/editclass', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ CNo: courseId, CName: courseName, CInfo: courseDescription })
        });
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
    
    closeCourseEditModal();
    navigateTo('课程库');
}

function openModal() {
    const modal = document.getElementById('addCourseModal');
    modal.style.display = "block";
}

function closeModal() {
    const modal = document.getElementById('addCourseModal');
    modal.style.display = "none";

    document.getElementById('courseName').value = '';
    document.getElementById('courseDescription').value = '';
}

// 处理表单提交
document.getElementById('addCourseForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const courseName = document.getElementById('courseName').value;
    const courseDescription = document.getElementById('courseDescription').value;
    
    addCourse(courseName, courseDescription);

    closeModal();
});


function logout() {
    alert('您已成功登出！');
    window.location.href = 'login.html';
}


async function renderScheduleTable() {
    schedule_list = []
    const content = document.getElementById('content');
    content.innerHTML = '<h2>课程安排表<button class="add-btn" onclick="openSetCourseModal()">新增安排</button></h2>';
    
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('schedule-table-container'); // 添加滚动容器
    
    const table = document.createElement('table');
    table.classList.add('schedule-table');
    
    const response = await fetch('http://localhost:5000/getregister');
    const scheduleData = await response.json();

    // 创建表头
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>课程名</th>
        <th>课程时间</th>
        <th>授课地点</th>
        <th>课程单价</th>
        <th>操作</th>
    `;
    table.appendChild(headerRow);
    
    // 创建每个课程项
    scheduleData.forEach(course => {
        schedule_list.push({RNo:course.RNo,CName:course.CName,Adr:course.Adr,TM:course.TM,Cap:course.Cap,Price:course.Price,Status:course.Status})

        // 简略信息行
        const row = document.createElement('tr');
        row.classList.add('schedule-item');
        row.setAttribute('data-id', course.RNo);
        
        row.innerHTML = `
            <td>${course.CName}</td>
            <td>${course.TM}</td>
            <td>${course.Adr}</td>
            <td>${course.Price + '元'}</td>
            <td><button class="set-btn" data-id="${course.RNo}">排课</button>
            <button class="rep-btn" data-id="${course.RNo}">代表</button>
            <button class="edit-btn" data-id="${course.RNo}">编辑</button>
            <button class="del-btn" data-id="${course.RNo}">删除</button>
            </td>
        `;
        
        // 添加点击事件，展开详细信息
        row.addEventListener('click', () => toggleDetails(course.RNo));
        
        table.appendChild(row);
        
        // 详细信息行
        const detailsRow = document.createElement('tr');
        detailsRow.classList.add('schedule-details');
        detailsRow.setAttribute('id', `details-${course.RNo}`);
        detailsRow.style.display = 'none';
        var st;
        if(course.Status == 0) st = "未开始";
        else st = "已完成";
        detailsRow.innerHTML = `
            <td colspan="4">
                <p><strong>课程容量：</strong>${course.Cap} 人</p>
                <p><strong>课程完成状态：</strong>${st}</p>
            </td>
        `;
        
        table.appendChild(detailsRow);
    });
    
    tableContainer.appendChild(table);
    content.appendChild(tableContainer);
    
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            openEditModal(event.target.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.del-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            deleteRegister(event.target.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.set-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            openScheduleModal(event.target.getAttribute('data-id'))
        });
    });

    document.querySelectorAll('.rep-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            openRepModal(event.target.getAttribute('data-id'))
        });
    });
}

// 切换课程详细信息的显示
function toggleDetails(courseId) {
    const detailsRow = document.getElementById(`details-${courseId}`);
    
    if (detailsRow.style.display === 'table-row') {
        detailsRow.style.display = 'none';
    } else {
        // 关闭其他展开的详细信息
        document.querySelectorAll('.schedule-details').forEach(row => row.style.display = 'none');
        
        // 显示当前课程的详细信息
        detailsRow.style.display = 'table-row';
    }
}

// 编辑课程模态框
function openEditModal(courseId) {
    const course = schedule_list.find(item => item.RNo == courseId);
    const modalContent = `
        <h3>编辑安排</h3>
        <form id="edit-form">
            <label for="course-name">课程名:</label>
            <input type="text" id="course-name" value="${course.CName}" readonly="readonly" required /><br>
            <label for="course-time">课程时间(YYYY-MM-DD):</label>
            <input type="text" id="course-time" value="${course.TM}" required /><br>
            <label for="course-location">授课地点:</label>
            <input type="text" id="course-location" value="${course.Adr}" required /><br>
            <label for="course-location">课程单价:</label>
            <input type="text" id="course-price" value="${course.Price}" required /><br>
            <label for="course-location">课程容量:</label>
            <input type="text" id="course-cap" value="${course.Cap}" required /><br>
            <label for="course-status">课程状态:</label>
            <select id="course-status">
                <option value="未开始" ${course.Status == 0 ? 'selected' : ''}>未开始</option>
                <option value="已完成" ${course.Status == 1 ? 'selected' : ''}>已完成</option>
            </select><br>
            <button type="submit">保存修改</button>
            <button type="button" id="close-modal">关闭</button>
        </form>
    `;
    const modal = document.createElement('div');
    modal.classList.add('edit-modal');
    modal.innerHTML = modalContent;
    
    document.body.appendChild(modal);
    
    // 关闭模态框
    document.getElementById('close-modal').addEventListener('click', () => {
        modal.remove();
    });

    // 保存修改
    document.getElementById('edit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        var id=courseId;
        var cname=document.getElementById('course-name').value;
        var tm=document.getElementById('course-time').value;
        var adr=document.getElementById('course-location').value;
        var price=document.getElementById('course-price').value;
        var cap=document.getElementById('course-cap').value;
        var st=document.getElementById('course-status').value;
        
        try{
            await fetch('http://localhost:5000/editregister', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    {RNo:id,CName:cname,Adr:adr,TM:tm,Cap:cap,Price:price,Status:st})
            });
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
        
        renderScheduleTable();

        modal.remove();
    });
}

// 为左侧菜单添加点击事件监听器
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('menu-schedule').addEventListener('click', function() {
        navigateTo('课程安排表');
    });
    document.getElementById('menu-library').addEventListener('click', function() {
        navigateTo('课程库');
    });
    document.getElementById('staff-library').addEventListener('click', function() {
        navigateTo('员工信息');
    });
    document.getElementById('staff-library').addEventListener('click', function() {
        navigateTo('课表查询');
    });
});


async function showEmployeeInfo() {
    const content = document.getElementById('content');
    content.innerHTML = '<h2>员工信息</h2><div id="employeeList" class="employee-list"></div>';

    const employeeList = document.getElementById('employeeList');

    // 添加标题行
    const headerRow = document.createElement('div');
    headerRow.classList.add('employee-list-header');

    const idHeader = document.createElement('span');
    idHeader.textContent = "员工号";
    idHeader.classList.add('employee-id');

    const nameHeader = document.createElement('span');
    nameHeader.textContent = "员工名";
    nameHeader.classList.add('employee-name');

    const genderHeader = document.createElement('span');
    genderHeader.textContent = "员工性别";
    genderHeader.classList.add('employee-gender');

    headerRow.appendChild(idHeader);
    headerRow.appendChild(nameHeader);
    headerRow.appendChild(genderHeader);
    employeeList.appendChild(headerRow);

    const response = await fetch('http://localhost:5000/getstaff');
    const employees = await response.json();

    // 添加员工信息行
    employees.forEach(employee => {
        const employeeItem = document.createElement('div');
        employeeItem.classList.add('employee-item');

        const idSpan = document.createElement('span');
        idSpan.textContent = employee.SNo;
        idSpan.classList.add('employee-id');

        const nameSpan = document.createElement('span');
        nameSpan.textContent = employee.SName;
        nameSpan.classList.add('employee-name');

        const genderSpan = document.createElement('span');
        genderSpan.textContent = employee.SSex;
        genderSpan.classList.add('employee-gender');

        employeeItem.appendChild(idSpan);
        employeeItem.appendChild(nameSpan);
        employeeItem.appendChild(genderSpan);

        employeeList.appendChild(employeeItem);
    });
}

// 打开课程设置模态框
function openSetCourseModal() {
    populateCourseDropdown();
    document.getElementById('setCourseModal').style.display = 'block';
}

// 关闭课程设置模态框
function closeSetCourseModal() {
    document.getElementById('setCourseModal').style.display = 'none';
    clearSetCourseForm();
    navigateTo('课程安排表');
}

// 填充下拉框选项
async function populateCourseDropdown() {
    const courseSelect = document.getElementById('course-select');
    courseSelect.innerHTML = '<option value="" disabled selected>请选择课程</option>'; // 清空并添加默认选项

    courses = await getClass();
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.CNo;
        option.textContent = course.CName;
        courseSelect.appendChild(option);
    });
}

// 清空设置表单
function clearSetCourseForm() {
    document.getElementById('course-select').value = '';
    document.getElementById('course-location').value = '';
    document.getElementById('course-time').value = '';
    document.getElementById('course-capacity').value = '';
    document.getElementById('course-price').value = '';
}

// 保存课程设置
async function saveCourseSettings() {
    const cid = document.getElementById('course-select').value;
    const adr = document.getElementById('course-location').value;
    const tm = document.getElementById('course-time').value;
    const cap = document.getElementById('course-capacity').value;
    const price = document.getElementById('course-price').value;

    if (!cid || !adr || !tm || !cap || !price) {
        alert('请完整填写所有字段');
        return;
    }

    try{
        await fetch('http://localhost:5000/addregister', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                {CNo:cid,Adr:adr,TM:tm,Cap:cap,Price:price})
        });
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
    closeSetCourseModal();
}

async function deleteRegister(courseId) {
    try {
        const response = await fetch(`http://localhost:5000/delregister/${courseId}`, { method: 'DELETE' });
        if (response.ok) {
            navigateTo('课程安排表');
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        alert('删除失败，该课程已有排课');
    }
}

// 打开排课模态框
let currentRegisterCourse;
function openScheduleModal(Rid) {
    currentRegisterCourse=Rid;
    populateEmployeeList(Rid);
    document.getElementById('scheduleModal').style.display = 'block';
}

function openRepModal(Rid) {
    currentRegisterCourse=Rid;
    populateRepList(Rid);
    document.getElementById('repModal').style.display = 'block';
}

// 关闭排课模态框
function closeScheduleModal() {
    document.getElementById('scheduleModal').style.display = 'none';
}

function closeRepModal() {
    document.getElementById('repModal').style.display = 'none';
}

// 填充员工列表
async function populateEmployeeList(Rid) {
    const employeeList = document.getElementById('employee-list');
    employeeList.innerHTML = ''; // 清空列表

    const response = await fetch('http://localhost:5000/getstaff');
    const employees = await response.json();

    const tmp = await fetch(`http://localhost:5000/get-teach-for-class/${Rid}`);
    const already = await tmp.json();
    console.log(already);
    employees.forEach(employee => {
        const row = document.createElement('tr');
        const selectCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.id = 
        checkbox.name = 'check'
        checkbox.type = 'checkbox';
        checkbox.value = employee.SNo;
        
        const result = already.find(item => item.SNo === employee.SNo);
        if(result != undefined){
            checkbox.checked = true;
        }
        selectCell.appendChild(checkbox);
        const idCell = document.createElement('td');
        idCell.textContent = employee.SNo;

        const nameCell = document.createElement('td');
        nameCell.textContent = employee.SName;

        const genderCell = document.createElement('td');
        genderCell.textContent = employee.SSex;

        row.appendChild(selectCell);
        row.appendChild(idCell);
        row.appendChild(nameCell);
        row.appendChild(genderCell);

        employeeList.appendChild(row);
    });
}

async function populateRepList(Rid) {
    const employeeList = document.getElementById('rep-list');
    employeeList.innerHTML = ''; // 清空列表

    const response = await fetch('http://localhost:5000/getRepresentatives');
    const employees = await response.json();

    const tmp = await fetch(`http://localhost:5000/get-learn-for-class/${Rid}`);
    const already = await tmp.json();
    console.log(already);
    employees.forEach(employee => {
        const row = document.createElement('tr');

        const result = already.find(item => item.RepNo === employee.RepNo);
        if(result != undefined){
            const idCell = document.createElement('td');
            idCell.textContent = employee.RepNo;

            const nameCell = document.createElement('td');
            nameCell.textContent = employee.RepName;

            row.appendChild(idCell);
            row.appendChild(nameCell);

            employeeList.appendChild(row);
        }
        
    });
}

// 保存排课
async function saveSchedule() {
    var obj = document.getElementsByName("check");
    checkList = []
    for(k in obj){
        if(obj[k].checked)
            checkList.push({SNo: obj[k].value, checked:1});
        else checkList.push({SNo: obj[k].value, checked:0});
    }

    const rid = currentRegisterCourse;
    try{
        await fetch('http://localhost:5000/addteach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                {RNo:rid,Info:checkList})
        });
        alert('排课成功！');
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }

    closeScheduleModal();
}


async function showScheduleQuery() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>课表查询</h2>
        <div class="role-selection">
            <label><input type="radio" name="role" value="employee" checked> 员工</label>
            <label style="margin-left: 20px;"><input type="radio" name="role" value="representative"> 公司代表</label>
        </div>
        <div class="search-bar">
            <input type="text" id="searchEmployeeId" placeholder="请输入员工号" style="width: 300px; padding: 8px; margin-right: 10px;">
            <button id="searchScheduleBtn" style="padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">查询</button>
        </div>
        <div id="scheduleList" class="schedule-list"></div>
    `;

    const scheduleList = document.getElementById('scheduleList');

    // 监听身份选择的变化
    document.querySelectorAll('input[name="role"]').forEach(radio => {
        radio.addEventListener('change', () => {
            scheduleList.innerHTML = ''; // 清空课表
        });
    });

    // 注册查询按钮点击事件
    document.getElementById('searchScheduleBtn').addEventListener('click', async () => {
        const employeeId = document.getElementById('searchEmployeeId').value.trim();
        const role = document.querySelector('input[name="role"]:checked').value;
        if (!employeeId) {
            alert('查询框不可为空');
            return;
        }
        // 从后端获取课表数据
        try{
            const response = await fetch(`http://localhost:5000/getSchedule?role=${role}&employeeId=${employeeId}`);
            const schedule = await response.json();
            renderScheduleList(schedule, role, scheduleList, employeeId);
        } catch {
            if(role === 'employee'){
                alert('员工不存在!');
            } else {
                alert('代表不存在!');
            }
        }
    });
}

// 渲染课表列表
function renderScheduleList(schedule, role, container, employeeId) {
    container.innerHTML = '';
    if(schedule.length == 0){
        alert('课表为空！');
    }
    // 添加课表信息行
    schedule.forEach((item, index) => {
        const scheduleItem = document.createElement('div');
        scheduleItem.classList.add('schedule-item');
        scheduleItem.style.cssText = 'margin-bottom: 10px; border: 1px solid #ccc; padding: 10px; border-radius: 5px;';

        scheduleItem.innerHTML = `
            <div>课程名称：${item.CName}</div>
            <div>时间：${item.TM}</div>
            <div>地点：${item.Adr}</div>
        `;
 
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '删除';
        deleteButton.style.cssText = 'margin-top: 10px; padding: 5px 10px; background-color: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;';
        deleteButton.addEventListener('click', async () => {
            await deleteSchedule(employeeId, item.RNo);
            alert('课程已删除');
            schedule.splice(index, 1); // 本地更新数据
            renderScheduleList(schedule, role, container, employeeId); // 重新渲染
        });
        scheduleItem.appendChild(deleteButton);
        
        container.appendChild(scheduleItem);
    });

    // 排课按钮，仅在员工身份且查询成功后显示
    if (role === 'employee') {
        const addScheduleButton = document.createElement('button');
        addScheduleButton.textContent = '新增排课';
        addScheduleButton.style.cssText = 'margin-top: 20px; padding: 8px 15px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;';
        addScheduleButton.addEventListener('click', () => alert('新增排课功能待实现'));
        container.appendChild(addScheduleButton);
    }
}

// 删除课表项（模拟请求）
async function deleteSchedule(employeeId, index) {
    console.log(employeeId)
    console.log(index)
    await fetch(`http://localhost:5000/deleteSchedule?`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: employeeId, idx: index }),
    });
}

async function showRepresentativeInfo() {
    const content = document.getElementById('content');
    content.innerHTML = '<h2>代表信息</h2><div id="companyList" class="company-list"></div>';

    const companyList = document.getElementById('companyList');
    
    // 添加公司标题行
    const headerRow = document.createElement('div');
    headerRow.classList.add('company-list-header');
    
    const companyHeader = document.createElement('span');
    companyHeader.textContent = "公司名";
    companyHeader.classList.add('company-name');
    
    headerRow.appendChild(companyHeader);
    companyList.appendChild(headerRow);

    // 从后端获取公司列表
    const response = await fetch('http://localhost:5000/getcompany');
    const companies = await response.json();

    // 添加公司行
    companies.forEach(company => {
        const companyItem = document.createElement('div');
        companyItem.classList.add('company-item');

        const companySpan = document.createElement('span');
        companySpan.textContent = company.CpName;
        companySpan.classList.add('company-name');

        // 创建一个包含公司名的整体 div
        const companyRow = document.createElement('div');
        companyRow.classList.add('company-row');
        companyRow.appendChild(companySpan);

        // 添加点击事件，点击公司整行展示/隐藏代表信息
        companyRow.addEventListener('click', async () => {
            const representativeList = document.getElementById(`representativeList-${company.CpNo}`);
            if (representativeList.style.display === 'block') {
                representativeList.style.display = 'none';  // 隐藏代表信息
            } else {
                showRepresentatives(company.CpNo, representativeList);  // 展示代表信息
                representativeList.style.display = 'block';  // 显示代表信息
            }
        });

        // 创建一个隐藏的代表信息容器
        const representativeList = document.createElement('div');
        representativeList.id = `representativeList-${company.CpNo}`;
        representativeList.style.display = 'none';  // 初始时隐藏代表信息
        companyItem.appendChild(companyRow);
        companyItem.appendChild(representativeList);

        companyList.appendChild(companyItem);
    });
}

async function showRepresentatives(companyId, representativeList) {
    // 获取代表信息
    const response = await fetch(`http://localhost:5000/getRepresentatives?companyId=${companyId}`);
    const representatives = await response.json();

    // 清空原有的代表信息（如果有的话）
    representativeList.innerHTML = '';

    if (representatives.length === 0) {
        representativeList.innerHTML = `<p>该公司暂无代表。</p>`;
        return;
    }

    // 添加代表标题
    const headerRow = document.createElement('div');
    headerRow.classList.add('representative-list-header');

    const repNoHeader = document.createElement('span');
    repNoHeader.textContent = "代表号";
    repNoHeader.classList.add('rep-no');

    const repNameHeader = document.createElement('span');
    repNameHeader.textContent = "代表名";
    repNameHeader.classList.add('rep-name');

    const repSexHeader = document.createElement('span');
    repSexHeader.textContent = "代表性别";
    repSexHeader.classList.add('rep-sex');

    headerRow.appendChild(repNoHeader);
    headerRow.appendChild(repNameHeader);
    headerRow.appendChild(repSexHeader);
    representativeList.appendChild(headerRow);

    // 显示所有代表信息
    representatives.forEach(rep => {
        const representativeItem = document.createElement('div');
        representativeItem.classList.add('representative-item');

        const repNoSpan = document.createElement('span');
        repNoSpan.textContent = rep.RepNo;
        repNoSpan.classList.add('rep-no');

        const repNameSpan = document.createElement('span');
        repNameSpan.textContent = rep.RepName;
        repNameSpan.classList.add('rep-name');

        const repSexSpan = document.createElement('span');
        repSexSpan.textContent = rep.RepSex;
        repSexSpan.classList.add('rep-sex');

        representativeItem.appendChild(repNoSpan);
        representativeItem.appendChild(repNameSpan);
        representativeItem.appendChild(repSexSpan);
        representativeList.appendChild(representativeItem);
    });
}

function closeInfo() {
    document.getElementById('recordsModal').style.display = 'none';
}

// 在左侧栏添加课程报名按钮，点击后展示报名界面
async function showCourseSignup() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>课程报名</h2>
        <div id="registrationForm">
            <label for="companySelect">请选择公司:</label>
            <select id="companySelect">
                <option value="">请选择公司</option>
            </select>
            <br><br>

            <label for="courseSelect">请选择课程安排:</label>
            <select id="courseSelect">
                <option value="">请选择课程</option>
            </select>
            <br><br>

            <!-- 修改部分：代表选择初始隐藏 -->
            <div id="representativeContainer" style="display: none;">
                <label for="representativeSelect">请选择代表:</label>
                <div id="representativeSelect">
                    <!-- 代表选择框 -->
                </div>
            </div>
            <br><br>

            <div id="summary">
                <p>选定代表人数: <span id="numRepresentatives">0</span></p>
                <p>总金额: <span id="totalAmount">0</span></p>
            </div>

            <button id="submitRegistration">提交报名</button>
            <button id="viewRecords">报名记录</button>
        </div>

        <div id="recordsModal" class="record-modal" style="display: none;">
            <div class="record-modal-content">
                <span class="close" id="closeModal" onclick="clossInfo()">&times;</span>
                <h3>报名记录</h3>
                <div id="recordsList">
                    <!-- 报名记录列表 -->
                </div>
            </div>
        </div>
    `;

    const companySelect = document.getElementById('companySelect');
    const courseSelect = document.getElementById('courseSelect');
    const representativeContainer = document.getElementById('representativeContainer'); // 修改部分
    const representativeSelect = document.getElementById('representativeSelect');
    const numRepresentatives = document.getElementById('numRepresentatives');
    const totalAmount = document.getElementById('totalAmount');
    const submitRegistration = document.getElementById('submitRegistration');

    // 获取公司列表
    const companyResponse = await fetch('http://localhost:5000/getcompany');
    const companies = await companyResponse.json();
    companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company.CpNo;
        option.textContent = company.CpName;
        companySelect.appendChild(option);
    });

    // 获取课程安排列表
    const courseResponse = await fetch('http://localhost:5000/getregister');
    const courses = await courseResponse.json();
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.RNo;
        option.textContent = course.CName + ' ' + course.TM;
        courseSelect.appendChild(option);
    });

    // 监听公司或课程选择，动态加载代表
    function toggleRepresentativeContainer() {
        if (companySelect.value && courseSelect.value) {
            representativeContainer.style.display = 'block'; 
        } else {
            representativeContainer.style.display = 'none';
            representativeSelect.innerHTML = ''; 
        }
    }

    companySelect.addEventListener('change', toggleRepresentativeContainer); 
    courseSelect.addEventListener('change', toggleRepresentativeContainer); 

    courseSelect.addEventListener('change', async (event) => {
        const courseNo = event.target.value;
        const companyNo = companySelect.value;
        if(courseNo){
            const representativeResponse = await fetch(`http://localhost:5000/getRepresentatives?companyId=${companyNo}`);
            const representatives = await representativeResponse.json();
            console.log(courseNo)
            const tmp = await fetch(`http://localhost:5000/get-learn-for-class/${courseNo}`);
            const already = await tmp.json();
            console.log(already);

            // 清空代表选择框
            representativeSelect.innerHTML = '';

            representatives.forEach(rep => {
                const result = already.find(item => item.RepNo === rep.RepNo);
                if(result != undefined){
                    return
                }

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = rep.RepNo;
                checkbox.classList.add('representative-checkbox');
                
                const label = document.createElement('label');
                label.textContent = `${rep.RepName} (${rep.RepSex})`;
                
                representativeSelect.appendChild(checkbox);
                representativeSelect.appendChild(label);
                representativeSelect.appendChild(document.createElement('br'));
            });
        }
    });

    // 监听代表选择，动态计算选定人数和总金额
    representativeSelect.addEventListener('change', async () => {
        const selectedRepresentatives = document.querySelectorAll('.representative-checkbox:checked');
        const numSelected = selectedRepresentatives.length;

        numRepresentatives.textContent = numSelected;

        // 获取单价并计算总金额
        
        const selectedCourse = courseSelect.value;
        if (selectedCourse && numSelected > 0) {
            const companyResponse = await fetch(`http://localhost:5000/getprice?RNo=${selectedCourse}`);
            const price = await companyResponse.json();
            const total = price[0]['Price'] * numSelected;
            totalAmount.textContent = total.toFixed(2);
        } else {
            totalAmount.textContent = '0.00';
        }
    });

    // 提交报名信息
    submitRegistration.addEventListener('click', async () => {
        const selectedCompany = companySelect.value;
        const selectedCourse = courseSelect.value;
        const selectedRepresentatives = Array.from(document.querySelectorAll('.representative-checkbox:checked')).map(checkbox => checkbox.value);
        if (selectedCompany && selectedCourse && selectedRepresentatives.length > 0) {
            const registrationData = {
                CpNo: selectedCompany,
                RNo: selectedCourse,
                Rep: selectedRepresentatives
            };
            
            // 发送报名信息到后端
            const response = await fetch('http://localhost:5000/addenroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData)
            });

            if (response.ok) {
                alert('报名成功');
                // 清空表单并隐藏代表选择框
                companySelect.value = '';
                courseSelect.value = '';
                representativeSelect.innerHTML = '';
                representativeContainer.style.display = 'none';
                numRepresentatives.textContent = '0';
                totalAmount.textContent = '0.00';
            } else {
                alert('报名失败');
            }
        } else {
            alert('请完整填写报名信息');
        }
    });

    viewRecords.addEventListener('click', async () => {
        recordsList.innerHTML = '';

        const response = await fetch('http://localhost:5000/getenroll');
        const enrollments = await response.json();

        enrollments.forEach(enrollment => {
            const record = document.createElement('div');
            record.classList.add('record-item');
            record.innerHTML = `
                <p>公司: ${enrollment.CpName}</p>
                <p>课程: ${enrollment.CName}</p>
                <p>时间: ${enrollment.TM}</p>
                <p>地点: ${enrollment.Adr}</p>
                <p>人数: ${enrollment.Cnt}</p>
                <p>金额: ${enrollment.Price}</p>
                <p>_______________________</p>
            `;
            recordsList.appendChild(record);
        });

        recordsModal.style.display = 'block';

    });
    

}

