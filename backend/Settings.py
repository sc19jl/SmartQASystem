import numpy as np
import torch
from transformers import AutoTokenizer

class Settings:
#     PROJ_NAME = 'Text-Similarity-Using-BERT'
#     root_path = os.getcwd().split(PROJ_NAME)[0] + PROJ_NAME + "\\"
#     APPLICATION_PATH = root_path + "backend\\services\\text_similarity\\application\\"
    # setting up logs path
#     LOGS_DIRECTORY = root_path + "backend\\services\\text_similarity\\logs\\logs.txt"

    checkpoint = "bert-base-uncased"
    tokenizer = AutoTokenizer.from_pretrained(checkpoint)

    # training data directory
    TRAIN_DATA = "E:\\DataSet\\QuoraPair\\train.csv.zip"

    # test data directory
    TEST_DATA = "E:\\DataSet\\QuoraPair\\test.csv"

    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # labels
    possible_labels = {'not_duplicate': 0, 'duplicate': 1}
    # number of labels
    num_labels = 1
    # dropout
    dropout = 0.3
    input_dim = 768

    # max length for embeddings
    max_len = 256

    # bert no decay layers
    no_decay = ["bias", "LayerNorm.bias", "LayerNorm.weight"]
    seed_value = 42
    test_size = 0.2

    # weights path
    WEIGHTS_PATH = "text_similarity_model.bin"
    TRAIN_BATCH_SIZE = 32
    VALID_BATCH_SIZE = 16
    EPOCHS = 10
    RANDOM_STATE = 42
    TRAIN_NUM_WORKERS = 4
    VAL_NUM_WORKERS = 2
    patience = 4
    mode = "max"
