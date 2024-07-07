Steps to setup Bhasha Bridge Language Translator.
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

1.Clone the Repository:

  Open your terminal (Command Prompt, PowerShell, or Terminal in VS Code).
  
  Clone the GitHub repository to your local machine:
  
  bash
  
    git clone <repository_url>
    
    cd <repository_name>

2.Open in VS Code:

  Launch Visual Studio Code.
  
  Open the cloned repository folder:

3.Create a Virtual Environment (.venu):

  Ensure Python (<=3.10) is installed on your system.
  
  Create a virtual environment named .venu:
  
  bash
  
    python -m venv .venu

4.Activate the Virtual Environment:

  Activate the virtual environment in your terminal:
  
  For Windows PowerShell:
  
  bash

    .\.venu\Scripts\Activate.ps1
    
  For Windows Command Prompt:
  
  bash

    .\.venu\Scripts\activate.bat
    
  For macOS/Linux:
  
  bash

    source .venu/bin/activate

5.Install Required Packages:

  Install the packages listed in the requirements.txt file:
  
  bash
  
    pip install -r requirements.txt

6.Install Any Additional Requirements:

  If there are other requirements not listed in requirements.txt, install them as needed:
  
  bash

    pip install <package_name>

7.Install and Place Additional Files:

   Obtain the additional files you mentioned and place them in the related folders as per your project's structure.

| Folder                           | File Name              | Link to Download                                                                      |
|----------------------------------|------------------------|---------------------------------------------------------------------------------------|
| indictrans2-en-indic-dist-200m   | model.safetensors      | [link](https://huggingface.co/ai4bharat/indictrans2-en-indic-dist-200M/tree/main)     |
| indictrans2-en-indic-dist-200m   | pytorch_model.bin      | [link](https://huggingface.co/ai4bharat/indictrans2-en-indic-dist-200M/tree/main)     |
| indictrans2-indic-en-dist-200M   | pytorch_model.bin      | [link](https://huggingface.co/ai4bharat/indictrans2-indic-en-dist-200M/tree/main)     |
| indictrans2-indic-indic-dist-320M| pytorch_model.bin      | [link](https://huggingface.co/ai4bharat/indictrans2-indic-indic-dist-320M/tree/main)  |

Example Folder Structure (Adjust accordingly):
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

CODE

│

├── .venu/                # Virtual environment directory

├──indictrans2-en-indic-dist-200m

├──indictrans2-indic-en-dist-200M

├──indictrans2-indic-indic-dist-320M

├── static/               # Static files directory

│   ├── css/

│   ├── javascript/

│   └── data/

├── templates/            # HTML template files

├── app.py                # Main application file

├── requirements.txt      # Requirements file

└── README.md             # Project readme file


8.Run the app.py file to start the application:

  bash
  
    python app.py
    
  After running the above command, you will see an output in the terminal indicating that the Flask server is running, along with the local IP address (typically http://127.0.0.1:5000).

9.Access the UI:

  Open your web browser.
  
  Navigate to the local IP address displayed in the terminal, usually http://127.0.0.1:5000.
  
  This will take you to the user interface of the BhashaBridge language translator website.
