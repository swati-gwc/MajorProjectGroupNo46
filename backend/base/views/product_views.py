from django.shortcuts import render

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from base.models import Product, Review
from base.serializers import ProductSerializer


from rest_framework import status

#For using saved ML model for sentiment analysis
from joblib import load
from sklearn.feature_extraction.text import CountVectorizer
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle



@api_view(['GET'])
def getProducts(request):
    query = request.query_params.get('keyword')
    if query == None:
        query = ''
    
    products = Product.objects.filter(name__icontains=query)
    
    page = request.query_params.get('page')
    paginator = Paginator(products, 4)

    try:
        products = paginator.page(page)
    except PageNotAnInteger:
        products = paginator.page(1)
    except EmptyPage:
        products = paginator.page(paginator.num_pages)
    
    if page == None:
        page = 1
    
    page = int(page)
    
    serializer = ProductSerializer(products,many = True)
    return Response({'products': serializer.data, 'page': page, 'pages':paginator.num_pages})

@api_view(['GET'])
def getTopProducts(request):
    products = Product.objects.filter(rating__gte=4).order_by('-rating')[0:5]
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getProduct(request,pk):
    product = Product.objects.get(_id = pk)
    serializer = ProductSerializer(product, many = False)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def createProduct(request):
    user = request.user
    product = Product.objects.create(
        user = user,
        name = 'Sample Name',
        price = 0,
        brand = 'Sample Brand',
        countInStock = 0,
        category = 'Sample Category',
        description = '',
    )
    serializer = ProductSerializer(product, many = False)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateProduct(request,pk):
    data = request.data
    product = Product.objects.get(_id = pk)

    product.name = data['name']
    product.price = data['price']
    product.brand = data['brand']
    product.countInStock = data['countInStock']
    product.category = data['category']
    product.description = data['description']
    product.save()
    
    serializer = ProductSerializer(product, many = False)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteProduct(request,pk):

    product = Product.objects.get(_id = pk)
    product.delete()
    return Response('Product Deleted')

@api_view(['POST'])
#@permission_classes([IsAdminUser])
def uploadImage(request):
    data = request.data

    product_id = data['product_id']
    product = Product.objects.get(_id = product_id)

    product.image = request.FILES.get('image')
    product.save()
    return Response('Image was uploaded')


vect = load('./ml_saved_models/vectorizer_dump.sav')
model = load('./ml_saved_models/sentiment_model.sav')
def predict_sentiment(sentence):
    sentiment_output = model.predict(vect.transform([sentence]))[0]
    return sentiment_output

new_model = tf.keras.models.load_model('./ml_saved_models/sarcasm_model.h5')
with open('./ml_saved_models/tokenizer.pickle', 'rb') as handle:
    token = pickle.load(handle)
def predict_sarcasm(review):
     # Set parameters
    vocab_size = 10000    # Max len of unique words
    embedding_dim = 200   # Embedding dimension value
    max_length = 60       # Max length of sentence
    padding_type = 'post' # pad_sequences arg
    oov_tok = '<OOV>'     # Unknow words = <OOV>
    training_portion = .7 # train test split 70:30
    #sentence = ["This book was really good until page 2."]
    sentence = [review]
    sequences = token.texts_to_sequences(sentence)
    padded = pad_sequences(sequences, maxlen=max_length, padding=padding_type, truncating='post')
    #print(new_model.predict(padded)[0][0])
    sarcasm_score = float(new_model.predict(padded)[0][0])
    return sarcasm_score


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createProductReview(request, pk):
    user = request.user
    product = Product.objects.get(_id=pk)
    data = request.data

    # 1 - Review already exists
    alreadyExists = product.review_set.filter(user=user).exists()
    if alreadyExists:
        content = {'detail': 'Product already reviewed'}
        return Response(content, status=status.HTTP_400_BAD_REQUEST)

    # 3 - Create review
    else:
        ouput_sentiment = predict_sentiment(data['comment'])
        output_sarcasm = predict_sarcasm(data['comment'])

        if output_sarcasm >=0.6 and ouput_sentiment == 1:
            ouput_sentiment = 0
            
        review = Review.objects.create(
            user=user,
            product=product,
            name=user.first_name,
            rating=data['rating'],
            comment=data['comment'],
            sentiment_predicted = ouput_sentiment,
            sarcasm_detected = output_sarcasm
        )

        reviews = product.review_set.all()
        product.numReviews = len(reviews)

        total = 0
        for i in reviews:
            total += i.rating

        product.rating = total / len(reviews)

        total_positive_sentiment = 0
        for i in reviews:
            if i.sentiment_predicted == 1:
                total_positive_sentiment += 1
        
        print(total_positive_sentiment)
        product.sentiment_rating = total_positive_sentiment / len(reviews)
        print(product.sentiment_rating)
        product.save()

        return Response('Review Added')