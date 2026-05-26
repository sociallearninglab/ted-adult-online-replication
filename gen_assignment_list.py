import random, json

N_CONDITIONS   = 2    # number of conditions
N_PARTICIPANTS = 120  # set > target N; DataPipe n_conditions must match this

# full shuffle — repeat conditions to fill N_PARTICIPANTS, then shuffle
slots = (list(range(N_CONDITIONS)) * (N_PARTICIPANTS // N_CONDITIONS + 1))[:N_PARTICIPANTS]
random.shuffle(slots)

print(json.dumps(slots))
