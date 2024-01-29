class Candidate {
    constructor(name, voters, votes) {
        this.name = name;
        this.voters = voters;
        this.votes = votes;
    }

    vote() {
        this.votes++;
    }

    decreaseVote() {
        this.votes--;
    }

    getVotes() {
        return this.votes;
    }

    addVoter(voter) {
        this.voters.push(voter);
    }

    getVoters() {
        return this.voters;
    }

    getCandidateName() {
        return this.name;
    }

    removeVoter(voterName) {
        for (let i = 0; i < this.voters.length; i++) {
            if (this.voters[i] === voterName) {
                this.voters.splice(i, 1);
                this.decreaseVote();
                break;
            }
        }
    }
}

class Vote {
    constructor() {
        this.candidates = [];
        this.totalVotes = 0;
    }

    setId(id) {
        this.id = id;
    }

    getId() {
        return this.id;
    }

    addCandidate(candidate) {
        this.candidates.push(candidate);
    }

    getCandidates() {
        return this.candidates;
    }

    showCandidates() {
        this.candidates.forEach((c) => {
            console.log(c);
        });
    }

    addVotes(candidateName, voterName) {
        this.candidates.forEach((candidate) => {
            if (candidate.name === candidateName) {
                candidate.addVoter(voterName);
                candidate.vote();
                this.totalVotes++;
            }
        });
    }

    deleteVote(candidateName, voterName) {
        this.candidates.forEach((candidate) => {
            if (candidate.name === candidateName) {
                candidate.removeVoter(voterName);
                this.totalVotes--;
            }
        })
    }

    setTotalVotes(x) {
        this.totalVotes = x;
    }

    getTotalVotes() {
        return this.totalVotes;
    }
}

const vote = new Vote();

const setDataToServer = async () => {
    try {
        const res = await axios.get('https://crudcrud.com/api/b8662b28fdef4c2ca4c46fdfd8117305/votes')
        if (res.data.length === 0) {
            let c1 = new Candidate("Stanley", [], 0);
            let c2 = new Candidate("Hitesh", [], 0);
            let c3 = new Candidate("Deepak", [], 0);

            vote.addCandidate(c1); vote.addCandidate(c2); vote.addCandidate(c3);

            await axios.post('https://crudcrud.com/api/b8662b28fdef4c2ca4c46fdfd8117305/votes', vote, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
        else {
            const res = await axios.get('https://crudcrud.com/api/b8662b28fdef4c2ca4c46fdfd8117305/votes');
            let candidates = res.data[0].candidates;
            vote.setId(res.data[0]._id)
            candidates.forEach((c) => {
                vote.addCandidate(new Candidate(c.name, c.voters, c.votes));
            });
            vote.setTotalVotes(res.data[0].totalVotes);
        }
    } catch (error) {
        console.log(error);
    }
};

const main = async () => {
    await setDataToServer();

    // adding candidates names to select
    let options = "";
    vote.getCandidates().forEach((c) => {
        options += `<option value=${c.name}>${c.name}</option>`;
    });
    document.getElementById("candidates").innerHTML = options;

    setCandidatesRow();
    addVotesToTable();
}; main();

document.getElementById('totalVotes').innerText = `Total Votes : ${vote.getTotalVotes()}`;

// adding candidates names and their votes into the outer table heading row

function setCandidatesRow() {
    let candidatesRow = "";
    vote.getCandidates().forEach((c) => {
        candidatesRow += `<th>${c.name} | <span class="text-danger">Votes : ${c.getVotes()}</span></th>`;
    });

    document.getElementById("candidatesRow").innerHTML = candidatesRow;
};

// adding each voters to the list of table

function addVotesToTable() {
    let votersList = "";

    vote.getCandidates().forEach((c, index) => {
        let voters = c.getVoters();
        voters.forEach((v) => {
            votersList += `
        <tr>
            <td>
                ${v}
            </td>
            <td>
                <button onclick="deleteVoter(event)" name=${c.getCandidateName()} id=${v} class="btn btn-danger btn-sm">Delete</button>
            </td>
        </tr>`
        });

        if (index === 0)
            document.getElementById('voters1').innerHTML = votersList;
        else if (index === 1)
            document.getElementById('voters2').innerHTML = votersList;
        else if (index === 2)
            document.getElementById('voters3').innerHTML = votersList;
        votersList = "";
    });
};

// Voting

document.getElementById('voteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    let voterName = document.getElementById('name').value;
    let selectElement = document.getElementById('candidates');
    let candidateName = selectElement.value;

    vote.addVotes(candidateName, voterName);
    document.getElementById('totalVotes').innerText = `Total Votes : ${vote.getTotalVotes()}`;

    await axios.put(`https://crudcrud.com/api/b8662b28fdef4c2ca4c46fdfd8117305/votes/${vote.getId()}`, vote)
    setCandidatesRow();
    addVotesToTable();
});

const deleteVoter = async (event) => {
    let candidateName = event.target.name;
    let voterName = event.target.id;

    event.target.parentElement.parentElement.remove();
    vote.deleteVote(candidateName, voterName);

    await axios.put(`https://crudcrud.com/api/b8662b28fdef4c2ca4c46fdfd8117305/votes/${vote.getId()}`, vote);
    document.getElementById('totalVotes').innerText = `Total Votes : ${vote.getTotalVotes()}`;
    setCandidatesRow();
}





