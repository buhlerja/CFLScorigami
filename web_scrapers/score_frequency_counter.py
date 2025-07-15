import os
import pandas as pd

# frequency_data = [(i, j, 0) for i in range(0, 76) for j in range (0, i + 1)] # Format is (winning score, losing score, frequency)
max_score = 100
frequency_data = [[0 for j in range(i + 1)] for i in range(max_score)]
for i in range(0, max_score):
    for j in range(0, i + 1):
        frequency_data[i][j] = 0

# Load the Excel file and the specific sheet (optional: specify sheet name with sheet_name="Sheet1")
df_in = pd.read_excel("match_data_all.xlsx", engine="openpyxl")
# Convert the DataFrame to a list of tuples
columns_to_use = [
    "Winning Score",
    "Losing Score"
]
filtered_df = df_in[columns_to_use]
match_data = list(filtered_df.itertuples(index=False, name=None))
# Print the result
for match in match_data:
    frequency_data[match[0]][match[1]] += 1

# Final tuple
frequency_data_tuple = [(i, j, frequency_data[i][j]) for i in range(0, 76) for j in range (0, i + 1)] # Format is (winning score, losing score, frequency)

df_out = pd.DataFrame(frequency_data_tuple, columns=["Winning Score", "Losing Score", "Frequency"])
# Output file path
output_file = "frequency_data_all.xlsx"
# Check if the file already exists
if os.path.exists(output_file):
    print(f"{output_file} already exists. The file will be overwritten.")
else:
    print(f"Creating new file: {output_file}")
# Save the data to Excel
df_out.to_excel(output_file, index=False)
print(f"Match data exported to {output_file}")
