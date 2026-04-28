import random, json

N_CONDITIONS   = 2    # number of conditions
N_PARTICIPANTS = 250  # set > target N; DataPipe n_conditions must match this

assert N_PARTICIPANTS % N_CONDITIONS == 0, "N_PARTICIPANTS must be divisible by N_CONDITIONS"

# block randomization — exact balance at every N_CONDITIONS slots
slots = []
for _ in range(N_PARTICIPANTS // N_CONDITIONS):
    block = list(range(N_CONDITIONS))
    random.shuffle(block)
    slots.extend(block)

print(json.dumps(slots))
