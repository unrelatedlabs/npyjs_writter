import numpy as np 

dt = np.dtype([("timestamp","i4")])
print(dt.descr)

arr = np.load("test.npy")

print(arr)