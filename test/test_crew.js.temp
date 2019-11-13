module.exports = createCrew;

let createUser = async (name) => {
    let req = await req.post("/users/", {username: name, password: name+"Pwd", email: name+"@ipsaone.space"});
    if(emptyUserReq.status !== 201) { throw "Error when creating EmptyUser"; }
    return req.body;
}

async function createCrew(req) {
    // Login as root
    let loginReq = await req.post("/auth/login", {username: "root", password: "OneServ_2017"});
    if(loginReq.status !== 200) { throw "Error when logging in as root"; }

    // Get groups info
    let groupInfo = await req.get('/groups/');
    let getGroupId = (name) => { return groupInfo.filter(g => g.name === name)[0].id; };

    // DefaultUser
    let DefaultUserInfo = await createUser("defaultUser");

    // OrganizerUser
    let OrganizerUserInfo = await createUser("organizerUser");
    let OrganizerId = getGroupId("organizers");

    // AuthorUser
    let AuthorUserInfo = await createUser("authorUser");
    let AuthorId = getGroupId("authors");

    // LeaderUser
    let LeaderUserInfo = await createUser("leaderUser");

    // MissionMember
    let MissionMemberInfo = await createUser("missionMember");

    // Group1User1
    let Group1User1Info = await createUser("group1User1");

    // Group1User2
    let Group1User2Info = await createUser("group1User2");

    // Group2User1
    let Group2User1Info = await createUser("group2User1");

    // Group2User2
    let Group2User2Info = await createUser("group2User2");

    // Logout
    let logoutReq = await req.get("/auth/logout");
}