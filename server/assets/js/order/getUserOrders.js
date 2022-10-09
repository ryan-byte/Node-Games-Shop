getUserOrders();


async function getUserOrders(){
    let request = await fetch("/api/user/getOrders");
    let data = await request.json();
    console.log(data);
}