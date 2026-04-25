function generatePost() {

    const topic = document.getElementById("topic").value;

    fetch("https://vk-post-ai.onrender.com/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            topic: topic,
            userId: "demo_user" // 🔥 ВОТ ОНО
        })
    })
        .then(res => res.json())
        .then(data => {

            document.getElementById("result").innerText = data.result;

            console.log("FREE LEFT:", data.freeLeft);
            console.log("PAID LEFT:", data.paidLeft);

        })
        .catch(err => {
            console.log(err);
            document.getElementById("result").innerText = "❌ Ошибка";
        });
}