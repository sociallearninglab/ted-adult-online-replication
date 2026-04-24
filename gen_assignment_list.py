import random, json

N_CONDITIONS   = 2   # number of conditions
N_PARTICIPANTS = 10  # must be divisible by N_CONDITIONS

assert N_PARTICIPANTS % N_CONDITIONS == 0, "N_PARTICIPANTS must be divisible by N_CONDITIONS"

slots = [i % N_CONDITIONS for i in range(N_PARTICIPANTS)]
random.shuffle(slots)
print(json.dumps(slots))
