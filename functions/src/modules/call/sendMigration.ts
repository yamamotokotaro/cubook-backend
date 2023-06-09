import * as functions from "firebase-functions";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

export default functions.region("asia-northeast1").https.onCall(async (data, context) => {
    const db = getFirestore();
    let res;
    const uidToMigration = data.uid;
    const groupIdToMigration = data.groupID;
    const decodedToken = context.auth!.token;
    const isAdmin = decodedToken.admin;
    const group = decodedToken.group;
    const uid = decodedToken.uid;
    const name = decodedToken.name;
    if (isAdmin) {
        const userRef = db.collection("user").where("group", "==", group).where("uid", "==", uidToMigration);
        const docsUser = await
            userRef.get();
        const userSnapshot = docsUser.docs[0];
        await db.collection("log").add({
            "operator": uid,
            "operatorName": name,
            "type": "migrateGroupAccount",
            "uid": uidToMigration,
            "name": userSnapshot.get("name"),
            "age": userSnapshot.get("age"),
            "grade": userSnapshot.get("grade"),
            "group": userSnapshot.get("group"),
            "groupToMigration": groupIdToMigration
        });
        await db.collection("migration").add({
            "operator": uid,
            "operatorName": name,
            "time": Timestamp.now(),
            "phase": "wait",
            "uid": uidToMigration,
            "name": userSnapshot.get("name"),
            "age": userSnapshot.get("age"),
            "grade": userSnapshot.get("grade"),
            "group": groupIdToMigration,
            "group_from": group,
            "groupName_from": userSnapshot.get("groupName"),
        })
        res = "success";
        return res;
    } else {
        res = "you are not admin";
        return res;
    }
})
